const express = require("express");
const router = express.Router();
const { getHandoversByBed } = require("../controllers/handovers.controller");
const {
  getPatients,
  getPatientByBed,
} = require("../controllers/patients.controller");

router.get("/", getPatients);
router.get("/:bed/handovers", getHandoversByBed);
router.get("/:bed", getPatientByBed);
module.exports = router;
