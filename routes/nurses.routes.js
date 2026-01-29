const express = require("express");
const router = express.Router();
const { getNurses } = require("../controllers/nurses.controller");
router.get("/", getNurses);

module.exports = router;
