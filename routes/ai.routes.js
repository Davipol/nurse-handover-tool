const express = require("express");
const router = express.Router();
const {
  getPatientSummary,
  getSingleHandoverSummary,
  getUnitDailySummary,
} = require("../controllers/ai.controller");

// Get AI summary for a specific patient by bed
router.get("/patients/:bed/summary", getPatientSummary);
router.get("/handovers/:id/summary", getSingleHandoverSummary);
router.get("/units/:id/summary", getUnitDailySummary);
module.exports = router;
