const express = require("express");
const router = express.Router();
const { getPatientSummary } = require("../controllers/ai.controller");

// Get AI summary for a specific patient by bed
router.get("/patients/:bed/summary", getPatientSummary);

module.exports = router;
