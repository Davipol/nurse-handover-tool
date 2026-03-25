const { fetchUnits } = require("../models/units.model");

const getUnits = async (req, res, next) => {
  try {
    const units = await fetchUnits();
    res.status(200).send({ units });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUnits };
