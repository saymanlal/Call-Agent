# Deployment Checklist - IVR Survey Platform

Use this checklist to ensure nothing is missed during deployment.

---

## Pre-Deployment Setup (Do Once)

### Create Required Accounts
- [ ] GitHub account (https://github.com/signup)
- [ ] Vercel account (https://vercel.com)
- [ ] Twilio account (https://www.twilio.com/try-twilio)
- [ ] Supabase account (https://app.supabase.com)
- [ ] Render account (https://render.com)

### Get Credentials from Twilio
- [ ] Copy Account SID (starts with AC...)
- [ ] Copy Auth Token
- [ ] Create and note Trial Phone Number (+1234567890 format)
- [ ] Verify personal phone number in Twilio (can only call verified numbers)

### Get Credentials from Supabase
- [ ] Create new project named `ivr-survey`
- [ ] Wait 2-3 minutes for project setup
- [ ] Copy Project URL (https://xxxxx.supabase.co)
- [ ] Copy Anon Key (starts with eyJ...)
- [ ] Copy Service Role Key (starts with eyJ...)
- [ ] Create database tables by running SQL schema

### Verify SQL Schema Applied
- [ ] Go to Supabase Table Editor
- [ ] See `surveys` table exists
- [ ] See `responses` table exists
- [ ] Check column names match schema

---

## Code Preparation

### Clone/Download Project
- [ ] Have entire project folder locally
- [ ] All files including backend/ folder present
- [ ] No node_modules folder (will be installed during deployment)
- [ ] .env files NOT included (only .env.example should be there)

### Frontend Files Present
- [ ] app/page.tsx exists
- [ ] app/layout.tsx exists
- [ ] components/FileUpload.tsx exists
- [ ] components/SurveyProgress.tsx exists
- [ ] package.json has all dependencies listed
- [ ] No hardcoded API URLs (should be env variables)

### Backend Files Present
- [ ] backend/server.js exists
- [ ] backend/supabaseClient.js exists
- [ ] backend/twilioIVR.js exists
- [ ] backend/excelUtils.js exists
- [ ] backend/setup-database.sql exists
- [ ] backend/package.json exists
- [ ] backend/.env.example exists
- [ ] backend/render.yaml exists (for Render deployment)

### Documentation Files Present
- [ ] README.md exists
- [ ] QUICK_START.md exists
- [ ] DEPLOYMENT_GUIDE.md exists
- [ ] PROJECT_STRUCTURE.md exists
- [ ] This file exists

---

## GitHub Repository Setup

### Create Repository
- [ ] Created new GitHub repo named `ivr-survey-platform`
- [ ] Set to Public or Private (your preference)
- [ ] Got HTTPS URL from GitHub (https://github.com/YOUR_USERNAME/ivr-survey-platform.git)

### Push Code to GitHub
- [ ] Ran `git init` locally
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "Initial commit"`
- [ ] Added remote: `git remote add origin YOUR_REPO_URL`
- [ ] Pushed to main: `git push -u origin main`
- [ ] Verified files appear on GitHub.com

### Verify .env is Ignored
- [ ] Checked that `backend/.env` is NOT in GitHub
- [ ] Checked that `.env.local` is NOT in GitHub
- [ ] .gitignore file exists and contains `.env`
- [ ] If accidentally pushed, remove with: `git rm --cached .env`

---

## Frontend Deployment (Vercel)

### Deploy Initial Version
- [ ] Logged into https://vercel.com
- [ ] Clicked "Add New Project"
- [ ] Imported GitHub repository
- [ ] Framework auto-detected as "Next.js"
- [ ] Clicked "Deploy"
- [ ] Waited for deployment to complete (3-5 minutes)
- [ ] Saw "Deployment successful" message
- [ ] **Copied Frontend URL** (e.g., https://ivr-survey-platform.vercel.app)

### Frontend is Now Live (Without Backend Connection Yet)
- [ ] Visited Frontend URL in browser
- [ ] Saw IVR Survey Platform dashboard
- [ ] Saw upload form, features, and instructions
- [ ] File upload area visible

### Add Backend URL to Vercel (Do After Backend is Live)
- [ ] Went to Vercel project Settings
- [ ] Found "Environment Variables"
- [ ] Added variable:
  - Name: `NEXT_PUBLIC_BACKEND_URL`
  - Value: `https://your-backend.onrender.com` (from Render)
- [ ] Clicked "Save"
- [ ] Waited for auto-redeploy

### Verify Frontend Connected to Backend
- [ ] Clicked "Redeploy" on most recent deployment
- [ ] Waited for deployment to complete
- [ ] Tested file upload on live site
- [ ] Backend should receive the file (check Render logs)

---

## Backend Deployment (Render)

### Create Render Service
- [ ] Logged into https://render.com
- [ ] Clicked "New Web Service"
- [ ] Clicked "Build and deploy from Git repository"
- [ ] Found and selected your GitHub repository
- [ ] Entered Name: `ivr-survey-backend`
- [ ] Set Root Directory: `backend`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Instance Type: `Free`

### Add Environment Variables to Render
Before deploying, added these variables in Render:
- [ ] TWILIO_ACCOUNT_SID=AC...
- [ ] TWILIO_AUTH_TOKEN=...
- [ ] TWILIO_PHONE_NUMBER=+1234567890
- [ ] SUPABASE_URL=https://xxxxx.supabase.co
- [ ] SUPABASE_KEY=eyJ...
- [ ] SUPABASE_SERVICE_KEY=eyJ...
- [ ] PORT=5000
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL=https://your-vercel-url.vercel.app
- [ ] BACKEND_URL=https://your-backend.onrender.com (use the Render URL shown on page)

### Deploy Backend Service
- [ ] Clicked "Create Web Service"
- [ ] Saw "Build in progress" message
- [ ] Waited 3-5 minutes for build to complete
- [ ] Saw green "Deploy" notification
- [ ] **Copied Backend URL** (shown on Render page, e.g., https://ivr-survey-backend.onrender.com)
- [ ] Saw "Service is live" message

### Verify Backend is Running
- [ ] Visited `https://your-backend.onrender.com/health`
- [ ] Saw JSON response: `{"status":"ok",...}`
- [ ] Checked Render Logs for any errors (should be none)
- [ ] Backend is ready for use

---

## Database Schema Creation

### Apply SQL Schema to Supabase
- [ ] Went to Supabase project
- [ ] Clicked "SQL Editor"
- [ ] Clicked "New Query"
- [ ] Opened `backend/setup-database.sql` file
- [ ] Copied entire content of setup-database.sql
- [ ] Pasted into SQL query editor
- [ ] Clicked "Run"
- [ ] Saw success message (no errors)

### Verify Tables Were Created
- [ ] Went to "Table Editor" in Supabase
- [ ] Saw `surveys` table listed
- [ ] Saw `responses` table listed
- [ ] Clicked on `surveys` table, verified columns
- [ ] Clicked on `responses` table, verified columns
- [ ] Checked that both tables are empty (ready for data)

### Verify Database Connection
- [ ] In Render logs, looked for connection success messages
- [ ] No "ECONNREFUSED" or database errors
- [ ] Backend successfully initialized database client

---

## Connection & Integration

### Frontend to Backend Connection
- [ ] Frontend URL updated with `NEXT_PUBLIC_BACKEND_URL`
- [ ] Frontend redeployed on Vercel
- [ ] Tested upload on live site
- [ ] Check browser console for CORS errors (there shouldn't be any)

### Verify All Three Connected
- [ ] Frontend is on Vercel ✓
- [ ] Backend is on Render ✓
- [ ] Database is on Supabase ✓
- [ ] All three can communicate

---

## Testing & Validation

### Test File Upload
- [ ] Created test Excel file:
  - Column A: Your name
  - Column B: Your phone number (must be verified in Twilio)
- [ ] Saved as .xlsx format
- [ ] Went to Frontend URL
- [ ] Uploaded test file
- [ ] Saw success message: "File uploaded successfully"
- [ ] Check Render logs: `POST /api/surveys/upload 200 OK`

### Test Database Storage
- [ ] Went to Supabase Table Editor
- [ ] Clicked `surveys` table
- [ ] Saw your uploaded survey listed
- [ ] Clicked `responses` table
- [ ] Saw your contact listed as pending
- [ ] Data was correctly stored

### Test Calling Feature
- [ ] On dashboard, clicked "Start Calling"
- [ ] Saw progress screen with "Calls in progress"
- [ ] **Within 10 seconds, your phone rang**
- [ ] Answered the call
- [ ] Heard greeting with your name
- [ ] Listened to first question
- [ ] Pressed 1 or 2 on phone keypad
- [ ] Heard appropriate response
- [ ] Call ended normally

### Test IVR Flow
- [ ] On first call, pressed 1 for "Math 12th passed"
- [ ] Heard second question about Engineering
- [ ] Pressed 1 for "Yes, interested"
- [ ] Heard goodbye message
- [ ] Call ended

- [ ] On second call (if testing again), press 2 for "Math 12th not passed"
- [ ] Call should immediately end with goodbye
- [ ] Supabase shows response recorded

### Test Download Results
- [ ] Waited for calls to complete
- [ ] Clicked "Download Results"
- [ ] Excel file downloaded
- [ ] Opened file and verified:
  - Column A: Your name
  - Column B: Your phone
  - Column C: Mathematics answer (Yes/No)
  - Column D: Engineering interest (Interested/Not Interested)
  - Column E: Alternative course (if applicable)

---

## Post-Deployment Checks

### Security Verification
- [ ] No .env file in GitHub repository
- [ ] No API keys visible in code
- [ ] All secrets stored in Render environment variables
- [ ] HTTPS enabled on all URLs
- [ ] CORS properly configured (only allows Frontend domain)

### Performance Checks
- [ ] Frontend loads in under 3 seconds
- [ ] File upload works smoothly
- [ ] Progress updates in real-time (every 2 seconds)
- [ ] Backend responds to health check instantly
- [ ] No console errors in browser (F12 Developer Tools)

### Monitoring Setup
- [ ] Checked Vercel Analytics (optional but good)
- [ ] Set up Render alerts for service issues
- [ ] Verified Supabase usage hasn't exceeded free tier
- [ ] No warnings in any dashboard

---

## Production Readiness

### Before Making Live
- [ ] All tests passed
- [ ] No console errors
- [ ] All environment variables set
- [ ] Database tables created
- [ ] Credentials are correct and working

### After Going Live
- [ ] Shared Frontend URL with users
- [ ] Documented how to upload Excel files
- [ ] Provided sample Excel template
- [ ] Set up basic monitoring
- [ ] Have backup plan if services go down

---

## Troubleshooting Checklist

If Something Goes Wrong:

### Backend Not Starting
- [ ] Check Render Logs (Render → Service → Logs)
- [ ] Verify all environment variables are set
- [ ] Check SUPABASE_URL format is correct
- [ ] Check TWILIO_ACCOUNT_SID starts with AC
- [ ] Try redeploying: Render → Deployments → Latest → three dots → Redeploy

### File Upload Fails
- [ ] Check file is .xlsx format
- [ ] Verify Column A has names, Column B has phones
- [ ] Check backend logs for specific error
- [ ] Ensure backend is running (/health endpoint works)
- [ ] Check NEXT_PUBLIC_BACKEND_URL is correct in Vercel

### Calls Not Being Made
- [ ] Verify Twilio phone number has credit ($15 trial)
- [ ] Check that personal phone is verified in Twilio
- [ ] Verify phone number format: +1234567890
- [ ] Check Render logs for Twilio API errors
- [ ] Verify TWILIO_ACCOUNT_SID and AUTH_TOKEN are correct

### Database Errors
- [ ] Go to Supabase → SQL Editor → Recent
- [ ] Check for failed queries
- [ ] Verify SUPABASE_KEY and SERVICE_KEY are correct
- [ ] Verify setup-database.sql was run successfully
- [ ] Check tables exist in Table Editor

### Progress Not Updating
- [ ] Check browser console (F12)
- [ ] Verify backend URL in environment variables
- [ ] Check CORS is enabled (backend should have it)
- [ ] Try refreshing page manually
- [ ] Check Render logs for errors

---

## Redeployment (If Changes Made)

### After Code Changes
1. Make changes locally
2. Run `git add .`
3. Run `git commit -m "Description of changes"`
4. Run `git push origin main`
5. Vercel auto-redeploys frontend
6. If backend changes, Render auto-redeploys

### If Environment Variables Change
- **Vercel**: Settings → Environment Variables → Save → Auto-redeploy
- **Render**: Environment → Save → Auto-redeploy

### If Database Schema Changes
- Go to Supabase → SQL Editor
- Create new query with changes
- Run and verify

---

## Maintenance Checklist (Monthly)

- [ ] Check Supabase storage usage (free: 500MB)
- [ ] Check Render logs for errors
- [ ] Verify Twilio free credits haven't expired
- [ ] Test a sample survey end-to-end
- [ ] Check for any GitHub security alerts
- [ ] Backup any important data from Supabase

---

## Final Verification

### All Systems Go?
- [ ] Frontend loads at vercel URL ✓
- [ ] Backend responds to /health ✓
- [ ] Database has tables created ✓
- [ ] File upload succeeds ✓
- [ ] Calls are being made ✓
- [ ] Responses recorded in database ✓
- [ ] Excel download works ✓
- [ ] No error messages ✓

**If all boxes checked: READY FOR PRODUCTION** ✓

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Frontend URL**: _________________  
**Backend URL**: _________________  
**Notes**: _________________

---

**Status**: Complete when all items are checked  
**Last Updated**: April 2026
