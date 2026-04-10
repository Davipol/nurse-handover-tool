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
    const updates = req.body;

    if (updates.nurse_id || updates.patient_id || updates.handover_date) {
      return res.status(400).send({
        msg: "Cannot update nurse_id, patient_id, or handover_date",
      });
    }

    const updatedHandover = await handoverModel.updateHandover(id, updates);

    if (!updatedHandover) {
      return res.status(404).send({ msg: "Handover not found" });
    }

    res.status(200).send({ handover: updatedHandover });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHandoverNotes,
  getHandoversByBed,
  postHandover,
  patchHandover,
};
