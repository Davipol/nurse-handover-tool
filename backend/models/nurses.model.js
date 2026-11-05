const db = require("../db/connection.js");

const fetchNurses = async () => {
  const { rows } = await db.query("SELECT id,name,email,unit_id FROM nurses");
  return rows;
};

const fetchNursebyEmail = async (email) => {
  const { rows } = await db.query("SELECT * FROM nurses WHERE email = $1", [
    email,
  ]);
  return rows[0] || null;
};

module.exports = { fetchNurses, fetchNursebyEmail };
