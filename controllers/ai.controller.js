const db = require("../db/connection");
const {
  summarizeHandovers,
  summarizeSingleHandover,
} = require("../models/ai.model");
const { fetchHandoversByBed } = require("../models/handovers.model");

const getPatientSummary = async (req, res, next) => {
  try {
    const { bed } = req.params;

    // Get all handovers for this patient
    const { patient, handovers } = await fetchHandoversByBed(bed);

    if (!patient) {
      return res.status(404).send({ msg: "No patient found in this bed" });
    }

    if (handovers.length === 0) {
      return res
        .status(404)
        .send({ msg: "No handovers found for this patient" });
    }

    // Generate AI summary of multiple handovers for same patient
    const summary = await summarizeHandovers(handovers);

    res.status(200).send({
      patient,
      handover_count: handovers.length,
      ai_summary: summary,
      disclaimer: "AI-generated summary - always verify with original notes",
    });
  } catch (err) {
    next(err);
  }
};

// Generate AI summary of single handover
const getSingleHandoverSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "SELECT * FROM handover_notes WHERE id = $1",
      [id],
    );
    const handover = rows[0];
    if (!handover) {
      return res.status(404).send({ msg: "Handover not found" });
    }
    const summary = await summarizeSingleHandover(handover);
    res.status(200).send({
      handover_note: handover,
      ai_summary: summary,
      disclaimer: "AI-generated summary - always verify with original note",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPatientSummary, getSingleHandoverSummary };
