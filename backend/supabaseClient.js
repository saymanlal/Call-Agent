import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create a new survey
export async function createSurvey(fileName, excelData) {
  const { data, error } = await supabase
    .from('surveys')
    .insert([
      {
        file_name: fileName,
        total_contacts: excelData.length,
        excel_data: excelData,
        status: 'pending'
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
}

// Function to update survey status
export async function updateSurveyStatus(surveyId, updates) {
  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('id', surveyId)
    .select();

  if (error) throw error;
  return data[0];
}

// Function to get survey by ID
export async function getSurvey(surveyId) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (error) throw error;
  return data;
}

// Function to create a response record
export async function createResponse(surveyId, contactData) {
  const { data, error } = await supabase
    .from('responses')
    .insert([
      {
        survey_id: surveyId,
        contact_name: contactData.name,
        phone_number: contactData.phone,
        call_status: 'pending'
      }
    ])
    .select();

  if (error) throw error;
  return data[0];
}

// Function to update response with answers
export async function updateResponse(responseId, answers) {
  const { data, error } = await supabase
    .from('responses')
    .update({
      math_12th_passed: answers.math12thPassed,
      engineering_interested: answers.engineeringInterested,
      alternative_course: answers.alternativeCourse,
      call_status: 'completed'
    })
    .eq('id', responseId)
    .select();

  if (error) throw error;
  return data[0];
}

// Function to get all responses for a survey
export async function getSurveyResponses(surveyId) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId);

  if (error) throw error;
  return data;
}

// Function to update survey response data
export async function updateSurveyResponses(surveyId, responses) {
  const { data, error } = await supabase
    .from('surveys')
    .update({
      responses: responses,
      completed_calls: responses.filter(r => r.call_status === 'completed').length,
      failed_calls: responses.filter(r => r.call_status === 'failed').length
    })
    .eq('id', surveyId)
    .select();

  if (error) throw error;
  return data[0];
}
