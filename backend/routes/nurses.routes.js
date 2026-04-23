const express = require("express");
const router = express.Router();
const { getNurses, loginNurse } = require("../controllers/nurses.controller");
router.get("/", getNurses);
router.post("/login", loginNurse);

module.exports = router;
