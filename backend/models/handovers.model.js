const db = require("../db/connection.js");

const fetchHandoverNotes = async () => {
  const { rows } = await db.query("SELECT * FROM handover_notes");
  return rows;
};

const fetchHandoverNotesByFilters = async (urgency, date, shift) => {
  let query = "SELECT * FROM handover_notes";
  const params = [];
  const conditions = [];

  if (urgency) {
    conditions.push(`urgency = $${params.length + 1}`);
    params.push(urgency);
  }

  if (date) {
    conditions.push(`handover_date::date = $${params.length + 1}`);
    params.push(date);
  }
  if (shift) {
    conditions.push(`shift = $${params.length + 1}`);
    params.push(shift);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY handover_date DESC, created_at DESC";

  const { rows } = await db.query(query, params);
  return rows;
};

const fetchHandoversByBed = async (bed) => {
  const patientResult = await db.query(
    "SELECT * FROM patients WHERE bed = $1",
    [bed],
  );

  const patient = patientResult.rows[0];

  if (!patient) return { patient: null, handovers: [] };

  const handoversResult = await db.query(
    `SELECT h.*, n.name as nurse_name, n.email as nurse_email
     FROM handover_notes h
     JOIN nurses n ON h.nurse_id = n.id
     WHERE h.patient_id = $1
     ORDER BY h.handover_date DESC, h.created_at DESC`,
    [patient.id],
  );

  return {
    patient,
    handovers: handoversResult.rows,
  };
};

const createHandover = async (handoverData) => {
  const {
    nurse_id,
    patient_id,
    handover_date,
    shift,
    urgency,
    vitals,
    content,
  } = handoverData;
  const { rows } = await db.query(
    "INSERT INTO handover_notes(nurse_id, patient_id, handover_date, shift, urgency, vitals, content) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [nurse_id, patient_id, handover_date, shift, urgency, vitals, content],
  );
  return rows[0];
};

const updateHandover = async (id, urgency) => {
  const { rows } = await db.query(
    `UPDATE handover_notes 
     SET urgency = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND is_voided = false
     RETURNING *`,
    [urgency, id],
  );
  return rows[0] || null;
};

const voidHandover = async (id, voided_by, void_reason) => {
  const { rows } = await db.query(
    `UPDATE handover_notes
     SET is_voided = true, voided_by = $1, voided_at = CURRENT_TIMESTAMP, void_reason = $2
     WHERE id = $3 AND is_voided = false
     RETURNING *`,
    [voided_by, void_reason, id],
  );
  return rows[0] || null;
};

module.exports = {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
  fetchHandoversByBed,
  createHandover,
  updateHandover,
  voidHandover,
};
