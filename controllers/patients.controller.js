const { fetchPatients } = require("../models/patients.model");

const getPatients = async (req, res, next) => {
  try {
    const patients = await fetchPatients();
    res.status(200).send({ patients });
  } catch (err) {
    next(err);
  }
};
module.exports = { getPatients };
