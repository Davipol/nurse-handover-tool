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
    "SELECT id, first_name, last_name, bed, status, unit_id FROM patients WHERE bed = $1",
    [bed],
  );

  const patient = patientResult.rows[0];

  if (!patient) return { patient: null, handovers: [] };

  const handoversResult = await db.query(
    "SELECT * FROM handover_notes WHERE patient_id = $1 ORDER BY handover_date DESC, created_at DESC",
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
module.exports = {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
  fetchHandoversByBed,
  createHandover,
};
