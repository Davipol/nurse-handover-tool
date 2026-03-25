const {
  fetchPatients,
  fetchPatientsByFilters,
  fetchPatientbyBed,
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

const getPatientByBed = async (req, res, next) => {
  try {
    const { bed } = req.params;
    const patient = await fetchPatientbyBed(bed);

    if (!patient) {
      return res.status(404).send({ msg: "No patient found in this bed" });
    }
    res.status(200).send({ patient });
  } catch (err) {
    next(err);
  }
};
module.exports = { getPatients, getPatientByBed };
