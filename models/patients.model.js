const db = require("../db/connection.js");

const fetchPatients = async () => {
  const { rows } = await db.query("SELECT * FROM patients");
  return rows;
};

module.exports = { fetchPatients };
