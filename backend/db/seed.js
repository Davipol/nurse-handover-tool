const format = require("pg-format");
const bcrypt = require("bcrypt");
const db = require("./connection.js");

// Low cost in tests so seeding stays fast; normal cost everywhere else
const SALT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 10;

const seed = async ({ units, nurses, patients, handoverNotes }) => {
  await db.query(
    "TRUNCATE TABLE handover_notes, patients, nurses, units RESTART IDENTITY CASCADE",
  );

  await db.query(
    format(
      "INSERT INTO units (name) VALUES %L",
      units.map((unit) => [unit.name]),
    ),
  );

  const nurseRows = await Promise.all(
    nurses.map(async (nurse) => [
      nurse.name,
      nurse.email,
      nurse.unit_id,
      await bcrypt.hash(nurse.password, SALT_ROUNDS),
    ]),
  );
  await db.query(
    format(
      "INSERT INTO nurses (name, email, unit_id, password_hash) VALUES %L",
      nurseRows,
    ),
  );

  await db.query(
    format(
      `INSERT INTO patients
        (first_name, last_name, date_of_birth, bed, conditions, status, unit_id, ai_summary, ai_summary_count)
       VALUES %L`,
      patients.map((p) => [
        p.first_name,
        p.last_name,
        p.date_of_birth,
        p.bed,
        JSON.stringify(p.conditions),
        p.status,
        p.unit_id,
        p.ai_summary ?? null,
        p.ai_summary_count ?? 0,
      ]),
    ),
  );

  await db.query(
    format(
      `INSERT INTO handover_notes
        (nurse_id, patient_id, handover_date, shift, urgency, vitals, content, is_voided, voided_by, voided_at, void_reason)
       VALUES %L`,
      handoverNotes.map((h) => [
        h.nurse_id,
        h.patient_id,
        h.handover_date,
        h.shift,
        h.urgency,
        JSON.stringify(h.vitals),
        h.content,
        h.is_voided ?? false,
        h.voided_by ?? null,
        h.voided_at ?? null,
        h.void_reason ?? null,
      ]),
    ),
  );
};

module.exports = seed;
