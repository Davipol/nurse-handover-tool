const db = require("../db/connection.js");

const fetchUnits = async () => {
  const { rows } = await db.query("SELECT * FROM units");
  return rows;
};

module.exports = { fetchUnits };
