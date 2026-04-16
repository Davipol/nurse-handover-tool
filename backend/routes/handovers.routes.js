const express = require("express");
const router = express.Router();
const {
  getHandoverNotes,
  postHandover,
  patchHandover,
  voidHandover,
} = require("../controllers/handovers.controller");
router.get("/", getHandoverNotes);
router.post("/", postHandover);
router.patch("/:id/urgency", patchHandover);
router.patch("/:id/void", voidHandover);

module.exports = router;
