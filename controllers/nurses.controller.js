const { fetchNurses } = require("../models/nurses.model");

const getNurses = async (req, res, next) => {
  try {
    const nurses = await fetchNurses();
    res.status(200).send({ nurses });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNurses };
