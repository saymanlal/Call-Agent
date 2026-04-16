import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import custom modules
import {
  createSurvey,
  updateSurveyStatus,
  getSurvey,
  createResponse,
  updateResponse,
  getSurveyResponses,
  updateSurveyResponses
} from './supabaseClient.js';

import {
  initiateCall,
  generateGreetingTwiml,
  generateQuestion1ResponseTwiml,
  generateQuestion2ResponseTwiml,
  generateQuestion3ResponseTwiml,
  getCallState,
  updateCallState,
  cleanupCallState
} from './twilioIVR.js';

import {
  parseExcelFile,
  generateUpdatedExcel,
  formatPhoneNumber,
  isValidPhoneNumber
} from './excelUtils.js';

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup directories
const uploadsDir = path.join(__dirname, 'uploads');
const resultsDir = path.join(__dirname, 'results');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Global state for managing concurrent calls
let callQueues = new Map(); // surveyId -> array of phone numbers to call
let activeCalls = new Map(); // surveyId -> number of active calls

// ==================== API Routes ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload Excel file and create survey
app.post('/api/surveys/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const { contacts, originalData, headers } = parseExcelFile(req.file.path);

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No valid contacts found in Excel file' });
    }

    // Validate phone numbers
    const validContacts = contacts.filter(c => isValidPhoneNumber(c.phone));
    if (validContacts.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers found in Excel file' });
    }

    // Create survey in database
    const survey = await createSurvey(req.file.originalname, {
      contacts: validContacts,
      headers: headers
    });

    // Create response records
    for (const contact of validContacts) {
      await createResponse(survey.id, contact);
    }

    // Initialize call queue
    callQueues.set(survey.id, validContacts.map(c => ({
      responseId: null, // Will be fetched when needed
      ...c
    })));
    activeCalls.set(survey.id, 0);

    res.json({
      success: true,
      survey: {
        id: survey.id,
        fileName: survey.file_name,
        totalContacts: survey.total_contacts,
        status: survey.status
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get survey details
app.get('/api/surveys/:surveyId', async (req, res) => {
  try {
    const survey = await getSurvey(req.params.surveyId);
    const responses = await getSurveyResponses(req.params.surveyId);

    res.json({
      survey: {
        id: survey.id,
        fileName: survey.file_name,
        totalContacts: survey.total_contacts,
        completedCalls: responses.filter(r => r.call_status === 'completed').length,
        failedCalls: responses.filter(r => r.call_status === 'failed').length,
        status: survey.status
      },
      responses: responses
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start calling for a survey
app.post('/api/surveys/:surveyId/start-calls', async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const survey = await getSurvey(surveyId);

    if (survey.status === 'in_progress') {
      return res.status(400).json({ error: 'Survey calls already in progress' });
    }

    // Update survey status
    await updateSurveyStatus(surveyId, { status: 'in_progress' });

    // Get all responses
    const responses = await getSurveyResponses(surveyId);

    // Start making calls in batches (max 5 concurrent)
    const MAX_CONCURRENT = 5;
    let callCount = 0;

    for (const response of responses) {
      if (callCount >= MAX_CONCURRENT) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before next batch
      }

      try {
        const phoneNumber = formatPhoneNumber(response.phone_number);
        await initiateCall(
          surveyId,
          response.id,
          response.contact_name,
          phoneNumber
        );
        callCount++;
      } catch (callError) {
        console.error(`Error initiating call to ${response.phone_number}:`, callError);
        // Continue with next contact
      }
    }

    res.json({
      success: true,
      message: `Started calling ${responses.length} contacts`,
      surveyId: surveyId
    });
  } catch (error) {
    console.error('Error starting calls:', error);
    res.status(500).json({ error: error.message });
  }
});

// IVR Webhook Routes

// Greeting TwiML
app.post('/api/ivr/greeting', async (req, res) => {
  try {
    const { surveyId, responseId, name } = req.query;
    const twiml = generateGreetingTwiml(decodeURIComponent(name || 'friend'));
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Greeting error:', error);
    res.status(500).send('<Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>');
  }
});

// Question 1 response (Math 12th)
app.post('/api/ivr/question1', async (req, res) => {
  try {
    const { Digits: answer, CallSid: callSid } = req.body;

    // Store the answer
    const state = getCallState(callSid);
    if (state) {
      state.answers.math12thPassed = answer === '1';
      updateCallState(callSid, state);
    }

    const twiml = generateQuestion1ResponseTwiml(answer);
    res.type('text/xml').send(twiml);

    // If answer is 1 (passed), we'll ask about engineering
    // If answer is 2 (not passed), we'll end the call
    if (answer === '2' && state) {
      // Update response in database
      await updateResponse(state.responseId, {
        math12thPassed: false,
        engineeringInterested: false,
        alternativeCourse: null
      });
    }
  } catch (error) {
    console.error('Question 1 error:', error);
    res.status(500).send('<Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>');
  }
});

// Question 2 response (Engineering Interest)
app.post('/api/ivr/question2', async (req, res) => {
  try {
    const { Digits: answer, CallSid: callSid } = req.body;

    const state = getCallState(callSid);
    if (state) {
      state.answers.engineeringInterested = answer === '1';
      updateCallState(callSid, state);

      // If not interested, ask for alternative course
      if (answer === '2') {
        const twiml = generateQuestion2ResponseTwiml(answer);
        return res.type('text/xml').send(twiml);
      }
    }

    const twiml = generateQuestion2ResponseTwiml(answer);
    res.type('text/xml').send(twiml);

    // If answer is 1 (interested in engineering), update database and end call
    if (answer === '1' && state) {
      await updateResponse(state.responseId, {
        math12thPassed: true,
        engineeringInterested: true,
        alternativeCourse: null
      });
    }
  } catch (error) {
    console.error('Question 2 error:', error);
    res.status(500).send('<Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>');
  }
});

// Question 3 response (Alternative Course)
app.post('/api/ivr/question3', async (req, res) => {
  try {
    const { Digits: answer, CallSid: callSid } = req.body;

    const courseMap = {
      '1': 'Science',
      '2': 'Commerce',
      '3': 'Arts',
      '4': 'Other'
    };

    const state = getCallState(callSid);
    if (state) {
      const course = courseMap[answer] || 'Unknown';
      state.answers.alternativeCourse = course;
      updateCallState(callSid, state);

      // Update database
      await updateResponse(state.responseId, {
        math12thPassed: true,
        engineeringInterested: false,
        alternativeCourse: course
      });
    }

    const twiml = generateQuestion3ResponseTwiml(answer);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Question 3 error:', error);
    res.status(500).send('<Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>');
  }
});

// Call status callback from Twilio
app.post('/api/ivr/status', async (req, res) => {
  try {
    const { CallSid: callSid, CallStatus: callStatus } = req.body;

    const state = getCallState(callSid);

    if (state && (callStatus === 'completed' || callStatus === 'failed')) {
      // Update response status if not already updated
      // The status might already be 'completed' if user answered questions
      // Only mark as failed if call didn't complete
      if (callStatus === 'failed') {
        await updateResponse(state.responseId, {
          math_12th_passed: null,
          engineering_interested: null,
          alternative_course: null,
          call_status: 'failed'
        });
      }

      // Clean up call state
      cleanupCallState(callSid);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Status callback error:', error);
    res.sendStatus(500);
  }
});

// Download updated Excel file
app.get('/api/surveys/:surveyId/download', async (req, res) => {
  try {
    const survey = await getSurvey(req.params.surveyId);
    const responses = await getSurveyResponses(req.params.surveyId);

    // Get original data from survey
    const originalData = survey.excel_data.contacts.map(c => ({
      'Name': c.name,
      'Phone': c.phone
    }));

    // Generate Excel file
    const timestamp = Date.now();
    const outputPath = path.join(resultsDir, `survey-results-${req.params.surveyId}-${timestamp}.xlsx`);
    generateUpdatedExcel(originalData, responses, outputPath);

    // Send file
    res.download(outputPath, `survey-results-${timestamp}.xlsx`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get real-time progress for a survey
app.get('/api/surveys/:surveyId/progress', async (req, res) => {
  try {
    const survey = await getSurvey(req.params.surveyId);
    const responses = await getSurveyResponses(req.params.surveyId);

    const completed = responses.filter(r => r.call_status === 'completed').length;
    const failed = responses.filter(r => r.call_status === 'failed').length;
    const pending = responses.filter(r => r.call_status === 'pending').length;

    res.json({
      surveyId: req.params.surveyId,
      status: survey.status,
      totalContacts: survey.total_contacts,
      completed,
      failed,
      pending,
      progress: {
        percentage: Math.round((completed / survey.total_contacts) * 100),
        completed,
        total: survey.total_contacts
      }
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`IVR Survey Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
