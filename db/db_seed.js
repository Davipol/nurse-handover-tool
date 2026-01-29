const db = require("./connection.js");

const seed = async () => {
  try {
    console.log("Db Seeding started");

    await db.query(
      "TRUNCATE TABLE handover_notes, patients, nurses, units RESTART IDENTITY CASCADE",
    );
    console.log("Cleared existing data");

    // Insert units
    const unitsResults = await db.query(`
      INSERT INTO units (name) VALUES 
      ('Cardiology'),
      ('Emergency Department'),
      ('Intensive Care Unit'),
      ('Respiratory'),
      ('Pediatrics'),
      ('Orthopedics')
      RETURNING id
    `);
    console.log("Inserted 6 units");

    // Insert Nurses
    const nursesResult = await db.query(`
      INSERT INTO nurses (name, email, unit_id) VALUES 
      ('Sarah Johnson', 'sarah.johnson@hospital.com', 1),
      ('Michael Chen', 'michael.chen@hospital.com', 2),
      ('Emily Rodriguez', 'emily.rodriguez@hospital.com', 3),
      ('David Kim', 'david.kim@hospital.com', 1),
      ('Jessica Williams', 'jessica.williams@hospital.com', 4),
      ('Ahmed Hassan', 'ahmed.hassan@hospital.com', 5)
      RETURNING id
    `);
    console.log("Inserted 6 nurses");

    // Insert Patients
    const patientsResult = await db.query(`
      INSERT INTO patients (first_name, last_name, date_of_birth, bed, conditions, status, unit_id) VALUES 
      ('John', 'Smith', '1965-03-15', 'C-101', '["Hypertension", "Type 2 Diabetes", "Coronary Artery Disease"]', 'admitted', 1),
      ('Mary', 'Williams', '1978-07-22', 'E-205', '["Acute Chest Pain"]', 'admitted', 2),
      ('Robert', 'Brown', '1955-11-30', 'I-302', '["Sepsis", "Respiratory Failure"]', 'admitted', 3),
      ('Jennifer', 'Davis', '1990-05-10', 'G-104', '["Post-operative Appendectomy"]', 'admitted', 4),
      ('William', 'Martinez', '1982-09-18', 'C-103', '["Myocardial Infarction"]', 'discharged', 1),
      ('Linda', 'Garcia', '2010-12-25', 'P-201', '["Pneumonia", "Asthma"]', 'admitted', 5)
      RETURNING id
    `);
    console.log("Inserted 6 patients");

    // Insert Handover Notes
    await db.query(`
      INSERT INTO handover_notes (nurse_id, patient_id, handover_date, shift, urgency, vitals, content) VALUES 
      (1, 1, '2026-01-29', 'day', 'routine', 
       '{"bloodPressure": "132/84", "pulse": 76, "temperature": 36.9, "respiratoryRate": 16, "oxygenSaturation": 97}',
       'Patient stable overnight. Blood glucose levels well controlled at 6.2 mmol/L. Continue current medication regimen. Patient ambulating well. No complaints of chest pain.'),
      
      (1, 1, '2026-01-28', 'night', 'urgent',
       '{"bloodPressure": "158/95", "pulse": 92, "temperature": 37.2, "respiratoryRate": 18, "oxygenSaturation": 95}',
       'BP elevated at 2300hrs. Dr. Patterson notified. Additional 5mg amlodipine given as per protocol. Patient reports mild dizziness. Monitor BP q2h overnight. Recheck in AM.'),
      
      (2, 2, '2026-01-29', 'day', 'critical',
       '{"bloodPressure": "95/62", "pulse": 118, "temperature": 38.1, "respiratoryRate": 24, "oxygenSaturation": 92}',
       'Patient admitted at 0300hrs with acute chest pain. Cardiology consult requested - Dr. Lee attending. ECG shows ST elevation. Preparing for emergency cath lab. Patient anxious. Family notified and present.'),
      
      (3, 3, '2026-01-28', 'night', 'critical',
       '{"bloodPressure": "88/55", "pulse": 125, "temperature": 39.2, "respiratoryRate": 28, "oxygenSaturation": 88}',
       'Septic patient requiring close monitoring. On vasopressor support (norepinephrine 0.15 mcg/kg/min). Increasing O2 requirements - now on 60% FiO2. Blood cultures drawn. Awaiting ICU consultant review. Family meeting scheduled for 0800hrs.'),
      
      (5, 4, '2026-01-29', 'day', 'routine',
       '{"bloodPressure": "118/72", "pulse": 68, "temperature": 36.8, "respiratoryRate": 14, "oxygenSaturation": 99}',
       'Post-op day 2. Wound site clean, dry, intact. Patient tolerating regular diet. Pain well controlled with oral analgesia (3/10). Ambulating in hallway with assistance. Plan for discharge tomorrow if continues to progress well.'),
      
      (6, 6, '2026-01-28', 'night', 'urgent',
       '{"bloodPressure": "105/68", "pulse": 115, "temperature": 38.8, "respiratoryRate": 32, "oxygenSaturation": 91}',
       'Pediatric patient with worsening respiratory status. Increased work of breathing noted. Nebulizer treatments given q4h. CXR shows bilateral infiltrates. Pediatric team aware. Mother at bedside, very anxious. Providing reassurance and updates.')
    `);
    console.log("Inserted 6 handover notes");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
