const db = require("../db/connection");
const {
  summarizeHandovers,
  summarizeSingleHandover,
  summarizeUnitDay,
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
    const summary = await summarizeUnitDay(unit.name, handovers, date);

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

module.exports = {
  getPatientSummary,
  getSingleHandoverSummary,
  getUnitDailySummary,
};
