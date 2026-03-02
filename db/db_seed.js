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
('John', 'Smith', '1965-03-15', 'C-1', '["Hypertension", "Type 2 Diabetes", "Coronary Artery Disease"]', 'admitted', 1),
('Mary', 'Williams', '1978-07-22', 'E-1', '["Acute Chest Pain"]', 'admitted', 2),
('Robert', 'Brown', '1955-11-30', 'I-1', '["Sepsis", "Respiratory Failure"]', 'admitted', 3),
('Jennifer', 'Davis', '1990-05-10', 'G-1', '["Post-operative Appendectomy"]', 'admitted', 4),
('William', 'Martinez', '1982-09-18', 'C-2', '["Myocardial Infarction"]', 'discharged', 1),
('Linda', 'Garcia', '2010-12-25', 'P-1', '["Pneumonia", "Asthma"]', 'admitted', 5)
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
       'Pediatric patient with worsening respiratory status. Increased work of breathing noted. Nebulizer treatments given q4h. CXR shows bilateral infiltrates. Pediatric team aware. Mother at bedside, very anxious. Providing reassurance and updates.'),
      (4, 1, '2026-02-03', 'day', 'routine',
       '{"bloodPressure": "135/88", "pulse": 74, "temperature": 36.8, "respiratoryRate": 16, "oxygenSaturation": 97}',
       'Patient recovering well. Blood pressure slightly elevated but stable. Blood glucose monitoring continues - readings between 6.0-7.5 mmol/L throughout the day. Patient walked in corridor twice with physiotherapy. Tolerating diet well. No concerns overnight.'),
  
     (1, 1, '2026-02-02', 'night', 'routine',
      '{"bloodPressure": "130/82", "pulse": 70, "temperature": 36.9, "respiratoryRate": 15, "oxygenSaturation": 98}',
      'Quiet night. Patient slept well. No complaints. Morning blood glucose 6.4 mmol/L. All medications given as prescribed. Ready for physiotherapy session this morning.'),
  
  
    (2, 2, '2026-02-03', 'night', 'urgent',
      '{"bloodPressure": "105/68", "pulse": 88, "temperature": 37.5, "respiratoryRate": 20, "oxygenSaturation": 95}',
      'Post-cath lab. Procedure completed successfully. Two stents placed in LAD. Groin site checked hourly - no bleeding or hematoma. Patient on bedrest for 6 hours post-procedure. Some chest discomfort reported - ECG unchanged. Cardiology team aware. Continue cardiac monitoring.'),
  
    (2, 2, '2026-01-30', 'day', 'critical',
      '{"bloodPressure": "98/60", "pulse": 112, "temperature": 38.0, "respiratoryRate": 22, "oxygenSaturation": 93}',
      'Patient transferred from cath lab to CCU. Significant ST elevation MI. Primary PCI performed. Patient anxious and experiencing chest pain 4/10. Morphine administered with good effect. Continuous cardiac monitoring. Family present and updated by cardiology team.'),
    (3, 3, '2026-02-03', 'night', 'urgent',
    '{"bloodPressure": "95/60", "pulse": 110, "temperature": 38.2, "respiratoryRate": 24, "oxygenSaturation": 92}',
    'Patient showing gradual improvement. Vasopressor requirements decreased - now on norepinephrine 0.10 mcg/kg/min. O2 requirements stable at 45% FiO2. Temperature trending down. Blood culture results pending. Continue current management. Family visited this evening, updated on progress.'),
  
    (3, 3, '2026-02-01', 'day', 'critical',
    '{"bloodPressure": "86/52", "pulse": 128, "temperature": 39.5, "respiratoryRate": 30, "oxygenSaturation": 87}',
    'Patient deteriorating. Increased vasopressor support required. Blood cultures positive for E. coli - antibiotics adjusted per microbiology. Requiring 65% FiO2. Consultant reviewed - considering intubation if no improvement. Renal function declining - urine output <0.5ml/kg/hr. Family meeting held.'),
  
    (3, 3, '2026-01-29', 'day', 'critical',
    '{"bloodPressure": "90/56", "pulse": 122, "temperature": 39.0, "respiratoryRate": 28, "oxygenSaturation": 89}',
    'New ICU admission. Septic shock secondary to pneumonia. Requiring high-flow oxygen and vasopressor support. Broad-spectrum antibiotics commenced. Central line inserted. Arterial line in situ. Hourly obs and bloods. Family very anxious - senior team to speak with them.'),
  (5, 4, '2026-02-03', 'night', 'routine',
   '{"bloodPressure": "115/70", "pulse": 66, "temperature": 36.7, "respiratoryRate": 14, "oxygenSaturation": 99}',
   'Patient sleeping well. No pain reported. Wound dressing dry and intact. Eating and drinking normally. Bowels not yet opened post-op but patient not uncomfortable. Mobilizing independently. Discharge planned for tomorrow morning if continues to progress well.'),
  
  (5, 4, '2026-02-02', 'day', 'routine',
   '{"bloodPressure": "120/75", "pulse": 70, "temperature": 36.9, "respiratoryRate": 15, "oxygenSaturation": 98}',
   'Post-op day 1. Patient managing pain well with oral analgesia. Wound clean and dry. Tolerating light diet. Mobilized to chair this morning with minimal assistance. No nausea or vomiting. Observations stable. Plan to increase mobilization today.'),
  
  
  (6, 6, '2026-02-03', 'day', 'routine',
   '{"bloodPressure": "98/62", "pulse": 88, "temperature": 36.9, "respiratoryRate": 20, "oxygenSaturation": 97}',
   'Significant improvement. Temperature normal for 24 hours. Respiratory rate decreased. Nebulizers now 8-hourly. Child playing with toys and eating well. Mother reports she slept through the night. Chest sounds much clearer on auscultation. Pediatric team pleased with progress - discussing discharge tomorrow.'),
  
  (6, 6, '2026-02-01', 'night', 'urgent',
   '{"bloodPressure": "102/66", "pulse": 105, "temperature": 38.2, "respiratoryRate": 28, "oxygenSaturation": 93}',
   'Child still requiring close monitoring. Increased work of breathing during night. Nebulizers given q4h with partial response. Temperature spiked to 38.5°C at 0200hrs - paracetamol given. Mother stayed at bedside throughout. Child taking small amounts of fluid. Pediatric registrar reviewed overnight.'),
  
  (6, 6, '2026-01-29', 'day', 'urgent',
   '{"bloodPressure": "105/70", "pulse": 110, "temperature": 38.5, "respiratoryRate": 30, "oxygenSaturation": 92}',
   'Pediatric admission with pneumonia. IV antibiotics commenced. Requiring supplemental oxygen via nasal cannula. Moderate work of breathing with intercostal recession. Regular nebulizers. CXR shows bilateral infiltrates. Mother very anxious but coping well. Child irritable but consolable.')
    `);
    console.log("Inserted 20 handover notes");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
