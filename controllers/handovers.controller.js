const {
  fetchHandoverNotes,
  fetchHandoverNotesByFilters,
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

module.exports = { getHandoverNotes };
