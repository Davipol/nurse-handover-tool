const express = require("express");
const router = express.Router();
const { getHandoversByBed } = require("../controllers/handovers.controller");
const { getPatients } = require("../controllers/patients.controller");

router.get("/", getPatients);
router.get("/:bed/handovers", getHandoversByBed);

module.exports = router;
