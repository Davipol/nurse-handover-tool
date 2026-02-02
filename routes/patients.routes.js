const express = require("express");
const router = express.Router();
const {
  getHandoverNotesByPatient,
} = require("../controllers/handovers.controller");
const { getPatients } = require("../controllers/patients.controller");

router.get("/", getPatients);
router.get("/:patient_id/handovers", getHandoverNotesByPatient);

module.exports = router;
