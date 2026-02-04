const express = require("express");
const router = express.Router();
const {
  getHandoverNotes,
  postHandover,
} = require("../controllers/handovers.controller");
router.get("/", getHandoverNotes);
router.post("/", postHandover);

module.exports = router;
