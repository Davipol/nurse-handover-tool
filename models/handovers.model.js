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
module.exports = {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
  fetchHandoversByBed,
};
