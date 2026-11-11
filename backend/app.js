const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://nurse-handover-tool-nli6.vercel.app",
    ],
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

app.use((req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, _req, res, next) => {
  if (["22P02", "22007", "22008"].includes(err.code)) {
    return res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    return res.status(404).send({ msg: "Not found" });
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
