ALTER TABLE handover_notes
ADD COLUMN is_voided BOOLEAN DEFAULT false,
ADD COLUMN voided_by INTEGER REFERENCES nurses(id),
ADD COLUMN voided_at TIMESTAMP,
ADD COLUMN void_reason TEXT;

CREATE INDEX idx_handover_notes_is_voided ON handover_notes(is_voided);