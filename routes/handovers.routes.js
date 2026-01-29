const express = require("express");
const router = express.Router();
const { getHandoverNotes } = require("../controllers/handovers.controller");
router.get("/", getHandoverNotes);

module.exports = router;
