const db = require("../db/connection");
const aiModel = require("../models/ai.model");
const handoverModel = require("../models/handovers.model");

const getPatientSummary = async (req, res) => {
  try {
    const { bed } = req.params;
    const handoversData = await handoverModel.fetchHandoversByBed(bed);

    if (!handoversData.patient) {
      return res.status(404).send({ msg: "Patient not found" });
    }

    if (!handoversData.handovers || handoversData.handovers.length === 0) {
      return res
        .status(404)
        .send({ msg: "No handovers found for this patient" });
    }

    // Check if cached summary exists and is up-to-date
    const patient = handoversData.patient;
    const currentHandoverCount = handoversData.handovers.length;

    if (patient.ai_summary) {
      console.log("Using cached AI summary");
      return res.status(200).send({
        ai_summary: patient.ai_summary,
        handover_count: currentHandoverCount,
        disclaimer: "AI-generated summary - always verify with original notes",
      });
    }

    // Only generate if no cache exists at all
    console.log("Generating new AI summary (no cache exists)");
    const summary = await generateAndCacheAISummary(bed);

    res.status(200).send({
      ai_summary: summary,
      handover_count: currentHandoverCount,
      disclaimer: "AI-generated summary - always verify with original notes",
    });
  } catch (err) {
    console.error("Error in getPatientSummary:", err);
    res.status(500).send({ msg: err.message });
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
    const summary = await aiModel.summarizeSingleHandover(handover);
    res.status(200).send({
      handover_note: handover,
      ai_summary: summary,
      disclaimer: "AI-generated summary - always verify with original note",
    });
  } catch (err) {
    next(err);
  }
};

const getUnitDailySummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .send({ msg: "Date parameter is required (format: YYYY-MM-DD)" });
    }

    // Get unit details
    const unitResult = await db.query("SELECT * FROM units WHERE id = $1", [
      id,
    ]);
    const unit = unitResult.rows[0];

    if (!unit) {
      return res.status(404).send({ msg: "Unit not found" });
    }

    // Get all handovers for this unit on this date
    const handoversResult = await db.query(
      `
      SELECT 
        h.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.bed
      FROM handover_notes h
      JOIN patients p ON h.patient_id = p.id
      WHERE p.unit_id = $1 
      AND h.handover_date::date = $2
      ORDER BY h.urgency DESC, h.created_at DESC
    `,
      [id, date],
    );

    const handovers = handoversResult.rows;

    if (handovers.length === 0) {
      return res
        .status(404)
        .send({ msg: "No handovers found for this unit on this date" });
    }

    // Generate AI summary for entire unit
    const summary = await aiModel.summarizeUnitDay(unit.name, handovers, date);

    res.status(200).send({
      unit: {
        id: unit.id,
        name: unit.name,
      },
      date,
      handover_count: handovers.length,
      ai_summary: summary,
      disclaimer: "AI-generated summary - always verify with original notes",
    });
  } catch (err) {
    next(err);
  }
};

const generateAndCacheAISummary = async (bed) => {
  try {
    const handoversData = await handoverModel.fetchHandoversByBed(bed);

    if (
      !handoversData.patient ||
      !handoversData.handovers ||
      handoversData.handovers.length === 0
    ) {
      return null;
    }

    // Generate AI summary
    const summary = await aiModel.summarizeHandovers(handoversData.handovers);

    // Cache it in the database
    await db.query(
      `UPDATE patients 
       SET ai_summary = $1, 
           ai_summary_count = $2, 
           ai_summary_updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [summary, handoversData.handovers.length, handoversData.patient.id],
    );

    return summary;
  } catch (err) {
    console.error("Error caching AI summary:", err);
    throw err;
  }
};

module.exports = {
  getPatientSummary,
  getSingleHandoverSummary,
  getUnitDailySummary,
  generateAndCacheAISummary,
};
