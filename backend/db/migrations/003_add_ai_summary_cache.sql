ALTER TABLE patients 
ADD COLUMN ai_summary TEXT,
ADD COLUMN ai_summary_count INTEGER DEFAULT 0,
ADD COLUMN ai_summary_updated_at TIMESTAMP;
