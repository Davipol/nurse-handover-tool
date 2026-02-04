const db = require("../db/connection.js");

const fetchPatients = async () => {
  const { rows } = await db.query("SELECT * FROM patients");
  return rows;
};

const fetchPatientsByFilters = async (unit, bed) => {
  let query = "SELECT * FROM patients";
  const params = [];
  const conditions = [];

  if (unit) {
    conditions.push(`unit_id = $${params.length + 1}`);
    params.push(unit);
  }
  if (bed) {
    conditions.push(`bed = $${params.length + 1}`);
    params.push(bed);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY bed";

  const { rows } = await db.query(query, params);
  return rows;
};

const fetchPatientbyBed = async (bed) => {
  const { rows } = await db.query("SELECT * FROM patients WHERE bed = $1", [
    bed,
  ]);
  return rows[0] || null;
};
module.exports = { fetchPatients, fetchPatientsByFilters, fetchPatientbyBed };
