import twilio from 'twilio';
import { updateResponse, getSurveyResponses, updateSurveyResponses, updateSurveyStatus } from './supabaseClient.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Missing Twilio credentials in environment variables');
}

const client = twilio(accountSid, authToken);

// In-memory store for tracking call state during IVR flow
const callState = new Map();

export async function initiateCall(surveyId, responseId, contactName, phoneNumber) {
  try {
    const twimlUrl = `${process.env.BACKEND_URL}/api/ivr/greeting?surveyId=${surveyId}&responseId=${responseId}&name=${encodeURIComponent(contactName)}`;

    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: twimlUrl,
      statusCallback: `${process.env.BACKEND_URL}/api/ivr/status`,
      statusCallbackMethod: 'POST'
    });

    // Store state mapping
    callState.set(call.sid, {
      surveyId,
      responseId,
      contactName,
      phoneNumber,
      step: 'greeting',
      answers: {}
    });

    return call;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
}

// Generate TwiML for greeting
export function generateGreetingTwiml(contactName) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Greet the contact by name
  twiml.say(
    `Hello ${contactName}. Thank you for taking this survey. We have a couple of questions for you.`,
    { voice: 'alice' }
  );

  // Ask first question: Have you passed 12th from Mathematics?
  const gather = twiml.gather({
    numDigits: 1,
    action: '/api/ivr/question1',
    method: 'POST',
    timeout: 10
  });

  gather.say('Press 1 if you have passed 12th standard from Mathematics, or press 2 if you have not.', {
    voice: 'alice'
  });

  // Fallback
  twiml.redirect('/api/ivr/greeting');

  return twiml.toString();
}

// Generate TwiML for question 1 response
export function generateQuestion1ResponseTwiml(answer) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (answer === '1') {
    // Math 12th passed - proceed to engineering question
    twiml.say('Great! You have passed 12th from Mathematics.', { voice: 'alice' });
    
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/ivr/question2',
      method: 'POST',
      timeout: 10
    });

    gather.say('Are you interested in pursuing Engineering? Press 1 for yes, or press 2 for no.', {
      voice: 'alice'
    });

    twiml.redirect('/api/ivr/question1');
  } else {
    // Math 12th not passed - end call
    twiml.say('Thank you for your response. We appreciate your time. Have a great day!', {
      voice: 'alice'
    });
    twiml.hangup();
  }

  return twiml.toString();
}

// Generate TwiML for question 2 response
export function generateQuestion2ResponseTwiml(answer) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (answer === '1') {
    // Interested in Engineering
    twiml.say('Excellent! Engineering is a great choice. Thank you for your time. Best wishes for your future!', {
      voice: 'alice'
    });
    twiml.hangup();
  } else {
    // Not interested - ask about alternative course
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/ivr/question3',
      method: 'POST',
      timeout: 10
    });

    gather.say(
      'We understand. Could you please tell us which course you are interested in? ' +
      'Press 1 for Science, press 2 for Commerce, press 3 for Arts, or press 4 for other.',
      { voice: 'alice' }
    );

    twiml.redirect('/api/ivr/question2');
  }

  return twiml.toString();
}

// Generate TwiML for question 3 response (alternative course)
export function generateQuestion3ResponseTwiml(answer) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const courseMap = {
    '1': 'Science',
    '2': 'Commerce',
    '3': 'Arts',
    '4': 'Other'
  };

  const course = courseMap[answer] || 'Unknown';

  twiml.say(`You are interested in ${course}. Thank you for your response. Have a wonderful day!`, {
    voice: 'alice'
  });

  twiml.hangup();

  return twiml.toString();
}

// Get call state
export function getCallState(callSid) {
  return callState.get(callSid);
}

// Update call state
export function updateCallState(callSid, updates) {
  const state = callState.get(callSid);
  if (state) {
    callState.set(callSid, { ...state, ...updates });
  }
}

// Clean up old call states
export function cleanupCallState(callSid) {
  callState.delete(callSid);
}

// Get Twilio client for status updates
export function getTwilioClient() {
  return client;
}
