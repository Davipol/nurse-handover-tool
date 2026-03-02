const express = require("express");
const router = express.Router();
const {
  getPatientSummary,
  getSingleHandoverSummary,
} = require("../controllers/ai.controller");

// Get AI summary for a specific patient by bed
router.get("/patients/:bed/summary", getPatientSummary);
router.get("/handovers/:id/summary", getSingleHandoverSummary);
module.exports = router;
