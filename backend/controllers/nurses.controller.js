const bcrypt = require("bcrypt");
const { fetchNurses, fetchNursebyEmail } = require("../models/nurses.model");

const getNurses = async (req, res, next) => {
  try {
    const nurses = await fetchNurses();
    res.status(200).send({ nurses });
  } catch (err) {
    next(err);
  }
};

const loginNurse = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ msg: "Email and password are required" });
    }
    const nurse = await fetchNursebyEmail(email);
    if (!nurse) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, nurse.password_hash);
    if (!validPassword) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }
    const { password_hash, ...nurseWithoutPassword } = nurse;
    res.status(200).send(nurseWithoutPassword);
  } catch (err) {
    next(err);
  }
};

module.exports = { getNurses, loginNurse };
