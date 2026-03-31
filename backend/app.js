const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());

const unitsRouter = require("./routes/units.routes");
app.use("/api/units", unitsRouter);

const nursesRouter = require("./routes/nurses.routes");
app.use("/api/nurses", nursesRouter);

const aiRouter = require("./routes/ai.routes");
app.use("/api", aiRouter);

const patientsRouter = require("./routes/patients.routes");
app.use("/api/patients", patientsRouter);

const handoverRouter = require("./routes/handovers.routes");
app.use("/api/handovers", handoverRouter);

app.use((err, _req, res, _next) => {
  res.status(500).send({ msg: err.message || "Internal server error" });
});

module.exports = app;
