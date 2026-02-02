const {
  fetchPatients,
  fetchPatientsByFilters,
} = require("../models/patients.model");

const getPatients = async (req, res, next) => {
  try {
    const { unit, bed } = req.query;
    let patients;
    if (unit || bed) {
      patients = await fetchPatientsByFilters(unit, bed);
    } else {
      patients = await fetchPatients();
    }
    res.status(200).send({ patients });
  } catch (err) {
    next(err);
  }
};
module.exports = { getPatients };
