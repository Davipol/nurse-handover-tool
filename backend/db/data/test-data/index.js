const vitals = {
  bloodPressure: "120/80",
  pulse: 72,
  temperature: 36.8,
  respiratoryRate: 16,
  oxygenSaturation: 98,
};

const units = [{ name: "Cardiology" }, { name: "Respiratory" }];

const nurses = [
  {
    name: "Sarah Johnson",
    email: "sarah@test.com",
    unit_id: 1,
    password: "Password1!",
  },
  {
    name: "David Kim",
    email: "david@test.com",
    unit_id: 1,
    password: "Password1!",
  },
  {
    name: "Jessica Williams",
    email: "jessica@test.com",
    unit_id: 2,
    password: "Password1!",
  },
];

const patients = [
  // 1: has a cached summary that is up to date (count matches 2 handovers)
  {
    first_name: "John",
    last_name: "Smith",
    date_of_birth: "1965-03-15",
    bed: "C-1",
    conditions: ["Hypertension"],
    status: "admitted",
    unit_id: 1,
    ai_summary: "Cached summary for C-1",
    ai_summary_count: 2,
  },
  // 2: has handovers but no cached summary
  {
    first_name: "Patricia",
    last_name: "Taylor",
    date_of_birth: "1972-08-14",
    bed: "C-2",
    conditions: ["Atrial Fibrillation"],
    status: "admitted",
    unit_id: 1,
  },
  // 3: has a cached summary that is stale (count 0, but 1 handover exists)
  {
    first_name: "Barbara",
    last_name: "White",
    date_of_birth: "1955-12-03",
    bed: "R-1",
    conditions: ["COPD"],
    status: "admitted",
    unit_id: 2,
    ai_summary: "Old summary for R-1",
    ai_summary_count: 0,
  },
  // 4: no handovers at all
  {
    first_name: "James",
    last_name: "Anderson",
    date_of_birth: "1958-04-22",
    bed: "C-3",
    conditions: [],
    status: "admitted",
    unit_id: 1,
  },
];

const handoverNotes = [
  {
    nurse_id: 1,
    patient_id: 1,
    handover_date: "2026-02-01",
    shift: "day",
    urgency: "routine",
    vitals,
    content: "Stable day.",
  },
  {
    nurse_id: 2,
    patient_id: 1,
    handover_date: "2026-02-02",
    shift: "night",
    urgency: "urgent",
    vitals,
    content: "BP raised overnight.",
  },
  {
    nurse_id: 1,
    patient_id: 2,
    handover_date: "2026-02-02",
    shift: "day",
    urgency: "critical",
    vitals,
    content: "Fast AF.",
  },
  {
    nurse_id: 2,
    patient_id: 2,
    handover_date: "2026-02-02",
    shift: "night",
    urgency: "urgent",
    vitals,
    content: "Entered on wrong patient.",
    is_voided: true,
    voided_by: 1,
    voided_at: "2026-02-03 09:00:00",
    void_reason: "Wrong patient",
  },
  {
    nurse_id: 3,
    patient_id: 3,
    handover_date: "2026-02-01",
    shift: "day",
    urgency: "urgent",
    vitals,
    content: "Increased SOB.",
  },
];

module.exports = { units, nurses, patients, handoverNotes };
