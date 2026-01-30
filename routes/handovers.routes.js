const express = require("express");
const router = express.Router();
const {
  getHandoverNotes,
  getHandoverNotesByUrgency,
} = require("../controllers/handovers.controller");
router.get("/", getHandoverNotes);

module.exports = router;
