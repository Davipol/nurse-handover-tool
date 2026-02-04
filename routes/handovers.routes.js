const express = require("express");
const router = express.Router();
const {
  getHandoverNotes,
  postHandover,
  patchHandover,
} = require("../controllers/handovers.controller");
router.get("/", getHandoverNotes);
router.post("/", postHandover);
router.patch("/:id", patchHandover);

module.exports = router;
