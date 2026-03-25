const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const unitsRouter = require("./routes/units.routes");
app.use("/api/units", unitsRouter);

const nursesRouter = require("./routes/nurses.routes");
app.use("/api/nurses", nursesRouter);

const patientsRouter = require("./routes/patients.routes");
app.use("/api/patients", patientsRouter);

const handoverRouter = require("./routes/handovers.routes");
app.use("/api/handovers", handoverRouter);

const aiRouter = require("./routes/ai.routes");
app.use("/api", aiRouter);

module.exports = app;
