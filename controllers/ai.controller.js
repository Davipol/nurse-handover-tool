const { summarizeHandovers } = require("../models/ai.model");
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

    // Generate AI summary
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

module.exports = { getPatientSummary };
