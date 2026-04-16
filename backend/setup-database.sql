-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  file_name TEXT NOT NULL,
  total_contacts INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  excel_data JSONB NOT NULL,
  responses JSONB DEFAULT '{}'::jsonb
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  math_12th_passed BOOLEAN,
  engineering_interested BOOLEAN,
  alternative_course TEXT,
  call_status TEXT DEFAULT 'pending',
  call_duration INTEGER DEFAULT 0,
  error_message TEXT
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for surveys table
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_phone ON responses(phone_number);

-- Enable RLS (Row Level Security) - optional, for security
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access for now (simplify for demo)
DROP POLICY IF EXISTS surveys_all_access ON surveys;
DROP POLICY IF EXISTS responses_all_access ON responses;

CREATE POLICY surveys_all_access ON surveys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY responses_all_access ON responses
  FOR ALL USING (true) WITH CHECK (true);
