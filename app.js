const express = require("express");
const app = express();

app.use(express.json());

const unitsRouter = require("./routes/units.routes");
app.use("/api/units", unitsRouter);

const nursesRouter = require("./routes/nurses.routes");
app.use("/api/nurses", nursesRouter);

const patientsRouter = require("./routes/patients.routes");
app.use("/api/patients", patientsRouter);

const handoverRouter = require("./routes/handovers.routes");
app.use("/api/handover_notes", handoverRouter);

module.exports = app;
