/*nurses table:
- id (primary key)
- name
- email
- unit (foreign key -> units.id)
- created_at
- updated_at

patients table: 
- id (primary key)
- created_at
- updated_at
- first name
- last name
- date of birth
- bed
- conditions
- status
- unit (foreign key -> units.id)

units table: 
- id (primary key)
- name

handover_notes table:
- id (primary key)
- nurse_id (foreign key → nurses.id)
- patient_id (foreign key → patients.id)
- created_at
- updated_at
- handover_date
- vitals
- urgency
- content
- shift
*/

-- Create ENUM types
CREATE TYPE urgency_level AS ENUM ('routine', 'urgent', 'critical');
CREATE TYPE shift_type AS ENUM ('day','night');
CREATE TYPE patient_status AS ENUM ('admitted', 'discharged', 'transferred');

-- Create tables
-- units table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
-- nurses table
CREATE TABLE nurses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    unit FOREIGN KEY REFERENCES units(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    bed VARCHAR(20),
    conditions JSONB DEFAULT '[]',
    status patient_status DEFAULT 'admitted',
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- handover notes table
CREATE TABLE handover_notes (
    id SERIAL PRIMARY KEY,
    nurse_id INTEGER NOT NULL REFERENCES nurses(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    handover_date DATE NOT NULL,
    shift shift_type NOT NULL,
    urgency urgency_level DEFAULT 'routine',
    vitals JSONB,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Indexes for better query performance
CREATE INDEX idx_handover_patient ON handover_notes(patient_id);
CREATE INDEX idx_handover_nurse ON handover_notes(nurse_id);
CREATE INDEX idx_handover_urgency ON handover_notes(urgency);
CREATE INDEX idx_handover_date ON handover_notes(handover_date);
CREATE INDEX idx_patients_unit ON patients(unit_id);
CREATE INDEX idx_vitals ON handover_notes USING GIN (vitals);