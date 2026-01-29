const { fetchHandoverNotes } = require("../models/handovers.model");

const getHandoverNotes = async (req, res, next) => {
  try {
    const handover_notes = await fetchHandoverNotes();
    res.status(200).send({ handover_notes });
  } catch (err) {
    next(err);
  }
};
module.exports = { getHandoverNotes };
