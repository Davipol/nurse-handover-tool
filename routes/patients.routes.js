const express = require("express");
const router = express.Router();
const { getPatients } = require("../controllers/patients.controller");
router.get("/", getPatients);

module.exports = router;
