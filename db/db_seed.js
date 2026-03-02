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
('Linda', 'Garcia', '2010-12-25', 'P-1', '["Pneumonia", "Asthma"]', 'admitted', 5),
-- Additional Cardiology patients
  ('Patricia', 'Taylor', '1972-08-14', 'C-3', '["Atrial Fibrillation", "Heart Failure"]', 'admitted', 1),
  ('James', 'Anderson', '1958-04-22', 'C-4', '["Angina", "Hyperlipidemia"]', 'admitted', 1),
  
  -- Additional Emergency Department patients
  ('Michael', 'Wilson', '1985-11-30', 'E-2', '["Trauma", "Suspected Fracture"]', 'admitted', 2),
  ('Sarah', 'Moore', '1990-02-17', 'E-3', '["Abdominal Pain"]', 'admitted', 2),
  
  -- Additional ICU patients
  ('Elizabeth', 'Thomas', '1945-06-25', 'I-2', '["ARDS", "Multi-organ Failure"]', 'admitted', 3),
  ('David', 'Jackson', '1963-09-12', 'I-3', '["Post-cardiac Arrest"]', 'admitted', 3),
  
  -- Additional Respiratory patients
  ('Barbara', 'White', '1955-12-03', 'G-2', '["COPD Exacerbation"]', 'admitted', 4),
  ('Richard', 'Harris', '1968-07-19', 'G-3', '["Pneumothorax"]', 'admitted', 4),
  
  -- Additional Pediatrics patients
  ('Emma', 'Martin', '2018-03-10', 'P-2', '["Bronchiolitis"]', 'admitted', 5),
  ('Noah', 'Thompson', '2015-09-22', 'P-3', '["Febrile Seizure"]', 'admitted', 5)
      RETURNING id
    `);
    console.log("Inserted 16 patients");

    // Insert Handover Notes
    await db.query(`
      INSERT INTO handover_notes (nurse_id, patient_id, handover_date, shift, urgency, vitals, content) VALUES 
      (1, 1, '2026-01-29', 'day', 'routine', 
       '{"bloodPressure": "132/84", "pulse": 76, "temperature": 36.9, "respiratoryRate": 16, "oxygenSaturation": 97}',
       'Patient stable overnight. Blood glucose levels well controlled at 6.2 mmol/L. Continue current medication regimen. Patient ambulating well. No complaints of chest pain.'),
      
(1, 7, '2026-02-03', 'day', 'urgent',
 '{"bloodPressure": "145/92", "pulse": 135, "temperature": 37.0, "respiratoryRate": 18, "oxygenSaturation": 96}',
 'Patient in fast AF. Rate poorly controlled despite medication. Feeling palpitations and slight SOB. Cardiology team reviewed - considering cardioversion if rate does not settle. IV metoprolol administered. Continue cardiac monitoring.'),

(4, 7, '2026-02-02', 'night', 'urgent',
 '{"bloodPressure": "140/88", "pulse": 142, "temperature": 36.9, "respiratoryRate": 20, "oxygenSaturation": 95}',
 'Patient went into AF at 0200hrs. HR 140-150. Patient symptomatic with chest discomfort and anxiety. Cardiology consulted. Rate control initiated. Monitoring closely.'),

(4, 8, '2026-02-03', 'day', 'routine',
 '{"bloodPressure": "128/78", "pulse": 72, "temperature": 36.7, "respiratoryRate": 14, "oxygenSaturation": 98}',
 'Patient stable. Admitted for investigation of chest pain. Troponins negative. ECG normal. Stress test planned for tomorrow. No chest pain overnight. Comfortable on current medication.'),

 (2, 9, '2026-02-03', 'day', 'critical',
 '{"bloodPressure": "110/70", "pulse": 98, "temperature": 36.8, "respiratoryRate": 22, "oxygenSaturation": 97}',
 'RTC victim. Suspected fractured femur and possible head injury. GCS 14. CT scan completed - no intracranial bleed. Ortho team consulted. Pain management ongoing. Awaiting theatre slot for femur fixation. Family present.'),

      (1, 1, '2026-01-28', 'night', 'urgent',
       '{"bloodPressure": "158/95", "pulse": 92, "temperature": 37.2, "respiratoryRate": 18, "oxygenSaturation": 95}',
       'BP elevated at 2300hrs. Dr. Patterson notified. Additional 5mg amlodipine given as per protocol. Patient reports mild dizziness. Monitor BP q2h overnight. Recheck in AM.'),
      
      (2, 2, '2026-01-29', 'day', 'critical',
       '{"bloodPressure": "95/62", "pulse": 118, "temperature": 38.1, "respiratoryRate": 24, "oxygenSaturation": 92}',
       'Patient admitted at 0300hrs with acute chest pain. Cardiology consult requested - Dr. Lee attending. ECG shows ST elevation. Preparing for emergency cath lab. Patient anxious. Family notified and present.'),
      
(2, 10, '2026-02-03', 'night', 'urgent',
 '{"bloodPressure": "118/75", "pulse": 88, "temperature": 37.8, "respiratoryRate": 16, "oxygenSaturation": 99}',
 'Right lower quadrant pain. Surgical team reviewed - ? appendicitis. Bloods show raised WCC. USS abdomen requested for morning. NBM since midnight. IV fluids running. Pain controlled with morphine.'),

      (3, 3, '2026-01-28', 'night', 'critical',
       '{"bloodPressure": "88/55", "pulse": 125, "temperature": 39.2, "respiratoryRate": 28, "oxygenSaturation": 88}',
       'Septic patient requiring close monitoring. On vasopressor support (norepinephrine 0.15 mcg/kg/min). Increasing O2 requirements - now on 60% FiO2. Blood cultures drawn. Awaiting ICU consultant review. Family meeting scheduled for 0800hrs.'),
      
(3, 11, '2026-02-03', 'night', 'critical',
 '{"bloodPressure": "92/58", "pulse": 115, "temperature": 38.9, "respiratoryRate": 32, "oxygenSaturation": 86}',
 'Intubated and ventilated. ARDS secondary to pneumonia. Very high FiO2 requirements (90%). Proning attempted with minimal improvement. On vasopressor and inotropic support. Renal replacement therapy commenced. Prognosis guarded. Family meeting held - aware of severity.'),

      (5, 4, '2026-01-29', 'day', 'routine',
       '{"bloodPressure": "118/72", "pulse": 68, "temperature": 36.8, "respiratoryRate": 14, "oxygenSaturation": 99}',
       'Post-op day 2. Wound site clean, dry, intact. Patient tolerating regular diet. Pain well controlled with oral analgesia (3/10). Ambulating in hallway with assistance. Plan for discharge tomorrow if continues to progress well.'),
      
(3, 12, '2026-02-03', 'day', 'critical',
 '{"bloodPressure": "105/65", "pulse": 95, "temperature": 36.0, "respiratoryRate": 16, "oxygenSaturation": 95}',
 'Post VF arrest. Therapeutic hypothermia protocol day 2. Sedated and ventilated. Neurological assessment pending rewarming. Cardiac function improving - echo shows good LV function. Coronary angiography showed LAD occlusion - stent placed. Awaiting neuro prognosis.'),

(5, 13, '2026-02-03', 'day', 'urgent',
 '{"bloodPressure": "135/82", "pulse": 95, "temperature": 37.3, "respiratoryRate": 26, "oxygenSaturation": 90}',
 'COPD exacerbation. Increased SOB and sputum production. On 2L O2 via nasal cannula. Nebulizers q4h. Steroids and antibiotics commenced. Chest physiotherapy. Respiratory team reviewed - may need NIV if deteriorates.'),

      (6, 6, '2026-01-28', 'night', 'urgent',
       '{"bloodPressure": "105/68", "pulse": 115, "temperature": 38.8, "respiratoryRate": 32, "oxygenSaturation": 91}',
       'Pediatric patient with worsening respiratory status. Increased work of breathing noted. Nebulizer treatments given q4h. CXR shows bilateral infiltrates. Pediatric team aware. Mother at bedside, very anxious. Providing reassurance and updates.'),
      (4, 1, '2026-02-03', 'day', 'routine',
       '{"bloodPressure": "135/88", "pulse": 74, "temperature": 36.8, "respiratoryRate": 16, "oxygenSaturation": 97}',
       'Patient recovering well. Blood pressure slightly elevated but stable. Blood glucose monitoring continues - readings between 6.0-7.5 mmol/L throughout the day. Patient walked in corridor twice with physiotherapy. Tolerating diet well. No concerns overnight.'),
  
     (1, 1, '2026-02-02', 'night', 'routine',
      '{"bloodPressure": "130/82", "pulse": 70, "temperature": 36.9, "respiratoryRate": 15, "oxygenSaturation": 98}',
      'Quiet night. Patient slept well. No complaints. Morning blood glucose 6.4 mmol/L. All medications given as prescribed. Ready for physiotherapy session this morning.'),
  
  (5, 14, '2026-02-03', 'night', 'routine',
 '{"bloodPressure": "122/76", "pulse": 78, "temperature": 36.6, "respiratoryRate": 16, "oxygenSaturation": 96}',
 'Chest drain in situ for pneumothorax. Minimal bubbling. CXR this AM shows good lung re-expansion. Respiratory comfortable on room air. Pain well controlled. Plan to clamp drain tomorrow if CXR remains satisfactory.'),

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
   'Pediatric admission with pneumonia. IV antibiotics commenced. Requiring supplemental oxygen via nasal cannula. Moderate work of breathing with intercostal recession. Regular nebulizers. CXR shows bilateral infiltrates. Mother very anxious but coping well. Child irritable but consolable.'),
   (6, 15, '2026-02-03', 'day', 'urgent',
 '{"bloodPressure": "90/55", "pulse": 145, "temperature": 38.0, "respiratoryRate": 45, "oxygenSaturation": 92}',
 'Infant with bronchiolitis. Increased work of breathing with nasal flaring and subcostal recession. On 1L O2. Tolerating small frequent feeds. NG tube in situ. Suction PRN. Mother at bedside. Pediatric team monitoring - threshold for escalation if oxygen requirements increase.'), 
 (6, 16, '2026-02-03', 'night', 'routine',
 '{"bloodPressure": "95/60", "pulse": 110, "temperature": 37.2, "respiratoryRate": 22, "oxygenSaturation": 98}',
 'Admitted following febrile seizure at home. Temperature settled with paracetamol. No further seizure activity. Child alert and playing. Viral illness suspected. Observations stable. Plan for discharge tomorrow if remains well. Parents reassured.')  
 `);
    console.log("Inserted 28 handover notes");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
