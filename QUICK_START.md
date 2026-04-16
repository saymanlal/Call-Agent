# Quick Start - IVR Survey Platform

**Just want to get it running? Follow these 3 simple steps.**

---

## Step 1: Get Your Credentials (5 minutes)

### Twilio (for calling)
1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify phone
3. In Console → Copy these:
   - **Account SID** (starts with AC...)
   - **Auth Token**
   - Get a Trial Number (click "Get a Trial Number")

### Supabase (for database)
1. Go to https://app.supabase.com/sign-up
2. Sign up with GitHub
3. Create project named `ivr-survey`
4. After 2-3 min → Go to Settings → API → Copy:
   - **Project URL**
   - **Anon Key**
   - **Service Role Key**
5. Go to SQL Editor → Run this query:

```sql
-- Copy entire backend/setup-database.sql file content
-- Paste and run it
```

---

## Step 2: Deploy (10 minutes)

### Frontend (Vercel)
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your repo
4. Click Deploy
5. **Save your Vercel URL**

### Backend (Render)
1. Go to https://render.com
2. New Web Service
3. Select GitHub repo
4. Set Root Directory: `backend`
5. Start Command: `node server.js`
6. Add Environment Variables:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   SUPABASE_URL=https://....supabase.co
   SUPABASE_KEY=...
   SUPABASE_SERVICE_KEY=...
   FRONTEND_URL=https://your-vercel-url.vercel.app
   BACKEND_URL=https://your-backend.onrender.com
   ```
7. Deploy
8. **Save your Render URL**

### Connect Frontend to Backend
1. Vercel → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_BACKEND_URL=https://your-render-url`
3. Redeploy

---

## Step 3: Test (5 minutes)

1. Open your Vercel URL
2. Create test Excel:
   - Column A: Your name
   - Column B: Your phone number
3. Upload file
4. Click "Start Calling"
5. **Your phone will ring!**
6. Answer and follow prompts (press 1 or 2)
7. Click "Download Results" to get Excel with responses

---

## That's It!

Your IVR Survey Platform is now live.

**For detailed setup**: Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**For full documentation**: Read [README.md](./README.md)

---

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Backend shows error | Wait 2 min, then refresh (Render needs time to start) |
| Upload fails | Use .xlsx format, ensure Column A=Names, Column B=Phones |
| No call received | Check Twilio has trial credit, phone number is verified |
| Downloaded Excel empty | Wait for call to complete, then try download again |

---

## File Upload Format

**Your Excel must have:**
- Column A: Contact Names (John, Jane, etc.)
- Column B: Phone Numbers (10-15 digits, with or without country code)

**Example**:
```
Name              | Phone
John Smith        | 5551234567
Jane Doe          | +1 (555) 123-4568
Bob Johnson       | 555-123-4569
```

---

## IVR Flow

When a call is made:
1. "Hello [Name], thank you for this survey"
2. "Have you passed 12th from Mathematics?" → Press 1 or 2
3. If Yes → "Interested in Engineering?" → Press 1 or 2
4. If No → "Which course?" → Press 1-4
5. "Thank you, goodbye!" → Hangup

All responses auto-saved to Excel!

---

## Need Help?

1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step
2. Check [README.md](./README.md) for detailed documentation
3. Twilio Docs: https://www.twilio.com/docs
4. Supabase Docs: https://supabase.com/docs
5. Render Docs: https://render.com/docs

---

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: April 2026
