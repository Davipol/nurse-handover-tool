const {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
  fetchHandoverByPatient,
} = require("../models/handovers.model");

const getHandoverNotes = async (req, res, next) => {
  try {
    const { urgency, date } = req.query;

    let handover_notes;
    if (urgency || date) {
      handover_notes = await fetchHandoverNotesByFilters(urgency, date);
    } else {
      handover_notes = await fetchHandoverNotes();
    }

    res.status(200).send({ handover_notes });
  } catch (err) {
    next(err);
  }
};

const getHandoverNotesByPatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const { patient, handovers } = await fetchHandoverByPatient(patient_id);

    if (!patient) {
      return res.status(404).send({ msg: "Patient not found" });
    }
    res.status(200).send({
      patient,
      handover_count: handovers.length,
      handover_notes: handovers,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { getHandoverNotes, getHandoverNotesByPatient };
