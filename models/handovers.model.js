const db = require("../db/connection.js");

const fetchHandoverNotes = async () => {
  const { rows } = await db.query("SELECT * FROM handover_notes");
  return rows;
};

module.exports = { fetchHandoverNotes };
