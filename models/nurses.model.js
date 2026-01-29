const db = require("../db/connection.js");

const fetchNurses = async () => {
  const { rows } = await db.query("SELECT * FROM nurses");
  return rows;
};

module.exports = { fetchNurses };
