const { generateAndCacheAISummary } = require("./ai.controller");
const db = require("../db/connection");
const handoverModel = require("../models/handovers.model");

const getHandoverNotes = async (req, res, next) => {
  try {
    const { urgency, date, shift } = req.query;

    let handovers;
    if (urgency || date || shift) {
      handovers = await handoverModel.fetchHandoverNotesByFilters(
        urgency,
        date,
        shift,
      );
    } else {
      handovers = await handoverModel.fetchHandoverNotes();
    }

    res.status(200).send({ handovers });
  } catch (err) {
    next(err);
  }
};

const getHandoversByBed = async (req, res, next) => {
  try {
    const { bed } = req.params;
    const { patient, handovers } = await handoverModel.fetchHandoversByBed(bed);

    if (!patient) {
      return res.status(404).send({ msg: "No patient found in this bed" });
    }
    res.status(200).send({
      patient,
      handover_count: handovers.length,
      handovers: handovers,
    });
  } catch (err) {
    next(err);
  }
};

const postHandover = async (req, res, next) => {
  try {
    const {
      nurse_id,
      patient_id,
      handover_date,
      shift,
      urgency,
      vitals,
      content,
    } = req.body;

    if (!nurse_id || !patient_id || !handover_date || !shift || !content) {
      return res.status(400).send({ msg: "Missing required fields" });
    }

    const newHandover = await handoverModel.createHandover(req.body);

    // Send response IMMEDIATELY
    res.status(201).send({ handover: newHandover });

    // Fire-and-forget: Use setImmediate to truly detach
    setImmediate(async () => {
      try {
        const patientResult = await db.query(
          "SELECT bed FROM patients WHERE id = $1",
          [patient_id],
        );
        if (patientResult.rows.length > 0) {
          const bed = patientResult.rows[0].bed;
          await generateAndCacheAISummary(bed);
          console.log(`AI summary regenerated for bed ${bed}`);
        }
      } catch (err) {
        console.error("Failed to regenerate AI summary:", err);
      }
    });
  } catch (err) {
    next(err);
  }
};
const patchHandover = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { urgency } = req.body;

    if (!urgency) {
      return res.status(400).send({ msg: "Only urgency can be updated" });
    }

    const updatedHandover = await handoverModel.updateHandover(id, urgency);

    if (!updatedHandover) {
      return res
        .status(404)
        .send({ msg: "Handover not found or already voided" });
    }

    res.status(200).send({ handover: updatedHandover });

    // Regenerate AI summary in background
    setImmediate(async () => {
      try {
        const patientResult = await db.query(
          "SELECT bed FROM patients WHERE id = $1",
          [updatedHandover.patient_id],
        );
        if (patientResult.rows.length > 0) {
          const bed = patientResult.rows[0].bed;
          await generateAndCacheAISummary(bed);
          console.log(
            `AI summary regenerated after urgency change for bed ${bed}`,
          );
        }
      } catch (err) {
        console.error("Failed to regenerate AI summary:", err);
      }
    });
  } catch (err) {
    next(err);
  }
};

const voidHandover = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voided_by, void_reason } = req.body;

    if (!voided_by || !void_reason) {
      return res
        .status(400)
        .send({ msg: "voided_by and void_reason are required" });
    }

    const voidedHandover = await handoverModel.voidHandover(
      id,
      voided_by,
      void_reason,
    );

    if (!voidedHandover) {
      return res
        .status(404)
        .send({ msg: "Handover not found or already voided" });
    }

    res.status(200).send({ handover: voidedHandover });

    // Regenerate AI summary in background (voided notes excluded)
    setImmediate(async () => {
      try {
        const patientResult = await db.query(
          "SELECT bed FROM patients WHERE id = $1",
          [voidedHandover.patient_id],
        );
        if (patientResult.rows.length > 0) {
          const bed = patientResult.rows[0].bed;
          await generateAndCacheAISummary(bed);
          console.log(`AI summary regenerated after void for bed ${bed}`);
        }
      } catch (err) {
        console.error("Failed to regenerate AI summary after void:", err);
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHandoverNotes,
  getHandoversByBed,
  postHandover,
  patchHandover,
  voidHandover,
};
