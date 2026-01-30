const db = require("../db/connection.js");

const fetchHandoverNotes = async () => {
  const { rows } = await db.query("SELECT * FROM handover_notes");
  return rows;
};

const fetchHandoverNotesByFilters = async (urgency, date) => {
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

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY handover_date DESC, created_at DESC";

  const { rows } = await db.query(query, params);
  return rows;
};
module.exports = { fetchHandoverNotes, fetchHandoverNotesByFilters };
