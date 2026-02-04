const {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
  fetchHandoversByBed,
  createHandover,
} = require("../models/handovers.model");

const getHandoverNotes = async (req, res, next) => {
  try {
    const { urgency, date, shift } = req.query;

    let handover_notes;
    if (urgency || date || shift) {
      handover_notes = await fetchHandoverNotesByFilters(urgency, date, shift);
    } else {
      handover_notes = await fetchHandoverNotes();
    }

    res.status(200).send({ handover_notes });
  } catch (err) {
    next(err);
  }
};

const getHandoversByBed = async (req, res, next) => {
  try {
    const { bed } = req.params;
    const { patient, handovers } = await fetchHandoversByBed(bed);

    if (!patient) {
      return res.status(404).send({ msg: "No patient found in this bed" });
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

const postHandover = async (req, res, next) => {
  try {
    const {
      nurse_id,
      patient_id,
      handover_date,
      shift,
      urgency,
      vitals,
      content,
    } = req.body;

    if (!nurse_id || !patient_id || !handover_date || !shift || !content) {
      return res.status(400).send({ msg: "Missing required fields" });
    }
    const newHandover = await createHandover(req.body);
    res.status(201).send({ handover_note: newHandover });
  } catch (err) {
    next(err);
  }
};
module.exports = { getHandoverNotes, getHandoversByBed, postHandover };
