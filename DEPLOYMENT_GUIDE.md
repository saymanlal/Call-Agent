# Complete Deployment Guide - IVR Survey Platform

**Estimated Time**: 30-45 minutes | **Difficulty**: Beginner Friendly

This guide walks you through deploying the IVR Survey Platform from development to production in simple steps.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Accounts & Credentials Setup](#accounts--credentials-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Connect Frontend to Backend](#connect-frontend-to-backend)
6. [Test Live Application](#test-live-application)
7. [Post-Deployment Verification](#post-deployment-verification)

---

## Prerequisites

Before starting, ensure you have:

- **Computer**: Mac, Windows, or Linux
- **Browser**: Chrome, Firefox, Safari, or Edge
- **Git**: Download from https://git-scm.com (click "Download for [Your OS]")
- **GitHub Account**: Free at https://github.com/signup
- **Text Editor**: VS Code recommended from https://code.visualstudio.com

**Check Git Installation**:
```bash
git --version
# Should output: git version 2.x.x or higher
```

---

## Accounts & Credentials Setup

### Create Free Accounts (In This Order)

#### 1. GitHub Account
1. Go to https://github.com/signup
2. Enter email, password
3. Click "Create account"
4. Verify email
5. **Note**: You'll need this for all deployments

#### 2. Vercel Account (Frontend)
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel with GitHub
4. Create team (skip optional)
5. **Save**: Vercel Dashboard URL

#### 3. Twilio Account (Voice Calling)
1. Go to https://www.twilio.com/try-twilio
2. Sign up with email
3. Click "Create free account"
4. Verify phone number (SMS will be sent)
5. After verification, go to Twilio Console: https://console.twilio.com

**In Twilio Console**:
- Find "Account SID" (starts with AC...) - **COPY THIS**
- Find "Auth Token" - **COPY THIS**
- Click "Get a Trial Number"
  - Select country (US)
  - Click "Search"
  - Select number (e.g., +1 (415) 555-1234)
  - Click "Choose this Number"
  - **COPY THIS PHONE NUMBER**

#### 4. Supabase Account (Database)
1. Go to https://app.supabase.com/sign-up
2. Sign up with GitHub (recommended)
3. Click "Authorize"
4. Create organization name
5. Click "Create new project"
   - Project name: `ivr-survey` (or any name)
   - Database password: Create strong password (e.g., `SecurePass123!@#`) - **SAVE THIS**
   - Region: Select closest to you
   - Click "Create new project"
6. **Wait 2-3 minutes** for project creation

**In Supabase**:
- Go to "Settings" → "API"
- **Project URL** (e.g., `https://xxxxx.supabase.co`) - **COPY THIS**
- **Anon Key** - **COPY THIS**
- **Service Role Key** - **COPY THIS**

#### 5. Render Account (Backend)
1. Go to https://render.com/register
2. Click "Sign up with GitHub"
3. Authorize Render with GitHub
4. Dashboard opens
5. **Note**: You'll use this later for backend deployment

---

## Create Your GitHub Repository

### Step 1: Initialize Local Repository
```bash
# Open Terminal/Command Prompt

# Navigate to your project folder
cd path/to/ivr-survey-platform

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial IVR Survey Platform commit"

# Create main branch (if not exists)
git branch -M main
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Enter repository name: `ivr-survey-platform`
3. Description: "IVR Survey Platform - Automated voice surveys with Excel"
4. Select "Public" (can change to Private later)
5. Click "Create repository"

### Step 3: Connect Local to GitHub
```bash
# Copy the HTTPS URL shown on GitHub (looks like https://github.com/YOUR_USERNAME/ivr-survey-platform.git)

# Add remote (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/ivr-survey-platform.git

# Push to GitHub
git push -u origin main

# Verify by refreshing GitHub page - files should appear
```

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Find and select your `ivr-survey-platform` repo
5. Click "Import"

### Step 2: Configure Frontend
On the "Configure Project" page:
1. **Framework Preset**: Should auto-detect "Next.js" ✓
2. **Root Directory**: Leave empty (or set to `.`)
3. **Build & Output Settings**: Leave as default
4. Click "Deploy"

**Wait for deployment** (Usually 3-5 minutes)

When done, you'll see:
- ✓ Build successful
- ✓ Deployments live
- **Copy your Frontend URL** (e.g., `https://ivr-survey-platform.vercel.app`)

### Step 3: Add Environment Variable
1. Go to "Settings" tab (on your Vercel project page)
2. Go to "Environment Variables"
3. Click "Add New"
4. Variable name: `NEXT_PUBLIC_BACKEND_URL`
5. Value: (leave empty for now, we'll add after backend deployment)
6. Click "Add"

**For now**, it will fail without backend. We'll fix this in Step 5.

---

## Backend Deployment (Render)

### Step 1: Prepare Backend Files
Your backend files should already be in `/backend` folder:
- `server.js`
- `package.json`
- `supabaseClient.js`
- `twilioIVR.js`
- `excelUtils.js`
- `.env.example`

### Step 2: Deploy to Render
1. Go to https://render.com/dashboard
2. Click "New Web Service"
3. Click "Build and deploy from Git repository"
4. Click "Connect account" if first time (authorize GitHub)
5. Find your repository in the list
6. Click "Select repository"

### Step 3: Configure Render Service
Fill in the form:

| Field | Value |
|-------|-------|
| Name | `ivr-survey-backend` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | `Free` |

Click "Create Web Service"

### Step 4: Add Environment Variables to Render

**Wait for** initial deployment to complete (shows error but that's OK - no env vars yet)

Then:
1. On the service page, click "Environment"
2. Click "Add Environment Variable"
3. Add each variable (one at a time):

```
TWILIO_ACCOUNT_SID=ACxxxxxxx...  (from Twilio console)
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  (your Twilio number)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...  (Anon Key from Supabase)
SUPABASE_SERVICE_KEY=eyJ...  (Service Role Key from Supabase)
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ivr-survey-platform.vercel.app  (your Vercel URL)
BACKEND_URL=https://ivr-survey-backend.onrender.com  (will show after deployment)
```

After adding all:
1. Click "Save"
2. Service will auto-restart
3. **Wait 2-3 minutes** for restart

**Verify Backend is Running**:
- Copy your Render URL (e.g., `https://ivr-survey-backend.onrender.com`)
- Visit `https://ivr-survey-backend.onrender.com/health`
- Should see: `{"status":"ok","timestamp":"2024-..."}`

**Copy Your Backend URL for next step**

### Step 5: Setup Supabase Database

1. Go to Supabase: https://app.supabase.com
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Copy entire content from `backend/setup-database.sql`
6. Paste into query editor
7. Click "Run"
8. Should see no errors (or "success" message)

**Verify Tables Created**:
1. Go to "Table Editor"
2. Should see two tables:
   - `surveys`
   - `responses`

If not visible, refresh the page.

---

## Connect Frontend to Backend

### Step 1: Update Frontend Environment Variable

1. Go to Vercel Dashboard → Your Project
2. Click "Settings"
3. Go to "Environment Variables"
4. Find `NEXT_PUBLIC_BACKEND_URL`
5. Click the three dots → Edit
6. Paste your **Backend URL** (from Render):
   ```
   https://ivr-survey-backend.onrender.com
   ```
7. Click "Save"

### Step 2: Redeploy Frontend

1. Go to "Deployments" tab
2. Find most recent deployment
3. Click the three dots → "Redeploy"
4. Confirm "Redeploy"
5. Wait for deployment to complete

**Your Frontend is now connected to Backend!**

---

## Test Live Application

### Step 1: Verify Frontend is Live
1. Go to your Frontend URL: `https://ivr-survey-platform.vercel.app`
2. Should see:
   - IVR Survey Platform heading
   - File upload section
   - How It Works instructions

### Step 2: Verify Backend Connection
1. In browser console (F12 → Console tab), look for any errors
2. Try uploading a test file:
   - Create Excel file with:
     - Column A: Your name
     - Column B: Your phone number
   - Click "Browse Files"
   - Select file
   - Should say "File uploaded successfully!"

### Step 3: Test End-to-End Call

**Important**: Twilio trial account can only call verified numbers (your own)

1. After successful upload, click "Start Calling"
2. **Your phone will ring in 5-10 seconds**
3. Answer the call
4. Listen to greeting with your name
5. When asked "Have you passed 12th from Mathematics?":
   - Press `1` for Yes, or `2` for No
6. Follow prompts (answering with 1 or 2)
7. Call ends with goodbye message

### Step 4: Download Results

1. Back on dashboard, click "Refresh Status"
2. When call completes, click "Download Results"
3. Open Excel file
4. Should see:
   - Column A: Your name
   - Column B: Your phone
   - Column C: Your answer to Math question
   - Column D: Engineering interest
   - Column E: Alternative course (if applicable)

---

## Post-Deployment Verification

### Checklist

- [ ] Frontend URL is accessible and loads without errors
- [ ] Backend health endpoint returns `{"status":"ok"}`
- [ ] File upload works (tested with real Excel)
- [ ] Backend receives uploaded file
- [ ] Twilio call was received
- [ ] IVR questions played correctly
- [ ] Responses recorded in database
- [ ] Excel download contains responses
- [ ] No sensitive credentials in GitHub

### Verify No Credentials in GitHub

```bash
# Make sure .env file is NOT pushed
git status
# Should NOT show "backend/.env" in the list
```

If .env is shown:
```bash
# Add to .gitignore
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push
```

---

## Common Issues During Deployment

### Issue: "Module not found" Error in Render

**Solution**:
1. Render → Your service → Logs
2. Look for error mentioning missing module
3. Go to GitHub, edit `backend/package.json`
4. Verify package is listed in dependencies
5. Push to GitHub
6. Render auto-redeployes

### Issue: "Database connection failed" Error

**Solution**:
1. Verify Supabase URL in backend .env
2. Verify Supabase key is correct
3. Verify database tables exist (check Supabase Table Editor)
4. Render → Environment variables → verify all Supabase vars set
5. Redeploy service

### Issue: "Backend URL returns 504 error"

**Solution**:
1. Usually backend is still starting up (can take 1-2 minutes)
2. Wait 2 more minutes
3. Try again
4. If persists, check Render Logs for errors

### Issue: Twilio "Invalid Auth Token"

**Solution**:
1. Go to Twilio Console: https://console.twilio.com
2. Copy Auth Token again (sometimes it changes)
3. Update in Render environment variables
4. Redeploy

### Issue: Excel file won't upload

**Solution**:
1. Verify file is .xlsx format (not .xls or .csv at first)
2. Verify Column A has names
3. Verify Column B has phone numbers
4. Check backend logs in Render for specific error
5. File should be under 5MB

### Issue: Calls not being made

**Solution**:
1. Verify Twilio phone number is in format: `+1234567890`
2. In Twilio: Verify your personal number is added to "Verified Caller IDs"
3. Check backend logs in Render
4. Verify backend received upload (check Supabase Table Editor for entry in `surveys` table)

---

## Monitoring & Maintenance

### Check Backend Health
```bash
# Visit this daily to ensure backend is running
https://your-backend-url.onrender.com/health
```

### View Backend Logs
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Filter by date/time

### Monitor Supabase Usage
1. Go to Supabase → Your project
2. Click "Usage" in sidebar
3. Check:
   - Database size
   - Egress usage
   - Auth sessions

### Renew Free Tier Services
1. **Render Free Tier**: Projects auto-pause after 15 min inactivity
   - Just visit your backend URL again to wake up
2. **Supabase Free Tier**: Reset monthly on first of month
3. **Vercel Free Tier**: Unlimited deployments

---

## Next Steps

### After Deployment Works

1. **Verify Security**:
   - Make sure no .env file in GitHub
   - Rotate Twilio Auth Token (optional but recommended)

2. **Scale Up** (Optional):
   - Change Render to Paid tier for always-on backend
   - Increase Twilio credits if doing large surveys
   - Monitor Supabase storage

3. **Add Features** (Optional):
   - More survey questions
   - SMS notifications
   - Email delivery of results
   - Advanced analytics

4. **Share with Team**:
   - Give them Frontend URL
   - They can start using immediately
   - All data stored securely in Supabase

---

## Support

### If You Get Stuck

1. **Frontend (Vercel)**: https://vercel.com/docs
2. **Backend (Render)**: https://render.com/docs
3. **Twilio**: https://www.twilio.com/docs
4. **Supabase**: https://supabase.com/docs

### Check Logs When Stuck
- **Vercel**: Project → Deployments → Click deployment → View logs
- **Render**: Service → Logs
- **Supabase**: SQL Editor → Check recent queries

---

## Estimated Costs

### Free Tier (What You're Using)
- **Vercel**: Free (unlimited deployments)
- **Render**: Free (750 hours/month, ~1 small service)
- **Supabase**: Free (500MB database, 5GB egress)
- **Twilio**: Free $15 trial credit (~150 calls)

### When Trial Expires
- Twilio calls: Pay as you go (~$0.015 per call)
- Scale other services if needed

---

**Congratulations! Your IVR Survey Platform is now live and ready to use.**

For questions, refer to README.md or individual service documentation.

Last Updated: April 2026
