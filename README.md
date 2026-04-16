# IVR Survey Platform

A fully automated Interactive Voice Response (IVR) survey platform that calls contacts, greets them by name, asks survey questions, and automatically updates an Excel file with responses.

**Status**: Production Ready | **Demo**: Fully Functional | **Deployment**: Vercel + Render/Railway

## Quick Start (3 Simple Steps)

### Step 1: Deploy Frontend to Vercel
```bash
git push origin main
# Go to vercel.com → Import Project → Select your GitHub repo → Deploy
```

### Step 2: Deploy Backend to Render
```bash
# Push backend folder or create new service on render.com
# Copy Backend URL (e.g., https://your-backend.onrender.com)
```

### Step 3: Add Environment Variables
1. Frontend (Vercel): Add `NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com`
2. Backend (Render): Add Twilio + Supabase credentials (see below)

**Done!** Your IVR platform is live.

---

## Project Structure

```
ivr-survey-platform/
├── app/                          # Next.js frontend
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── FileUpload.tsx            # Excel upload component
│   ├── SurveyProgress.tsx        # Real-time progress tracking
│   └── ui/                       # shadcn/ui components
├── backend/                      # Express backend
│   ├── server.js                 # Main server with API routes
│   ├── supabaseClient.js         # Supabase database client
│   ├── twilioIVR.js              # Twilio IVR logic
│   ├── excelUtils.js             # Excel parsing/generation
│   ├── setup-database.sql        # Database schema
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Environment template
├── package.json                  # Frontend dependencies
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **UI**: shadcn/ui components with Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js with Express
- **Voice**: Twilio IVR (Interactive Voice Response)
- **Database**: Supabase PostgreSQL
- **Deployment**: Render or Railway

### Key Features
- Excel file upload (.xlsx, .xls, .csv)
- Automated voice calling with Twilio
- Real-time progress tracking
- Database-backed responses
- Automatic Excel file generation with results
- DTMF (phone keypad) IVR interaction

---

## Detailed Setup Instructions

### Prerequisites
- Node.js 18+ installed locally
- GitHub account (for version control)
- Twilio account (free trial with $15 credits)
- Supabase account (free tier sufficient)
- Vercel account (free)
- Render or Railway account (free tier)

### Frontend Setup (Next.js)

#### 1. Local Development
```bash
# Clone or navigate to your project
cd your-project

# Install dependencies
npm install
# or
pnpm install

# Create .env.local for local development
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
# Open http://localhost:3000
```

#### 2. Deploy to Vercel

**Option A: Automatic (Recommended)**
```bash
# Push to GitHub
git add .
git commit -m "IVR Survey Platform"
git push origin main

# Go to https://vercel.com/new
# Click "Import Git Repository"
# Select your repository
# Click Deploy
```

**Option B: CLI**
```bash
npm install -g vercel
vercel login
vercel
```

#### 3. Add Frontend Environment Variables in Vercel
1. Go to your Vercel project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com`
3. Redeploy: Click "Redeploy"

---

### Backend Setup (Express)

#### 1. Set Up Twilio Account

**Get Free Credits:**
1. Go to https://www.twilio.com/try-twilio
2. Sign up with email
3. Accept free trial ($15 credit)
4. Verify phone number
5. Go to Console Dashboard
6. Copy your credentials:
   - **Account SID**: Under Account section (starts with AC...)
   - **Auth Token**: Under Account section
   - **Phone Number**: Create a new number (Console → Phone Numbers → Get Started)

**Important**: Twilio free trial numbers can only call verified numbers. Use your own number for testing.

#### 2. Set Up Supabase Database

1. Go to https://app.supabase.com/sign-up
2. Sign up with email/GitHub
3. Create a new project:
   - Organization: Create new
   - Project name: `ivr-survey`
   - Database password: Create strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project" (wait 2-3 minutes)

4. Once created, go to Settings → API
   - Copy **Project URL**: This is `SUPABASE_URL`
   - Copy **Anon Key**: This is `SUPABASE_KEY`
   - Copy **Service Role Key**: This is `SUPABASE_SERVICE_KEY`

5. Go to SQL Editor → New Query
6. Copy entire content from `backend/setup-database.sql`
7. Paste and click "Run"
8. Verify tables created: Go to Table Editor → Should see `surveys` and `responses` tables

#### 3. Local Backend Development

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with your credentials
cat > .env << EOF
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_actual_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
EOF

# Start development server
npm run dev
# Server running on http://localhost:5000
```

#### 4. Deploy Backend to Render

**Setup:**
1. Go to https://render.com/register
2. Sign up with GitHub (or email)
3. Click "New Web Service"
4. Connect GitHub repo (authorize if needed)
5. Fill in details:
   - **Name**: `ivr-survey-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Environment**: Production
   - **Instance Type**: Free (sufficient for testing)

**Add Environment Variables:**
1. Scroll to "Environment" section
2. Add each variable:
   ```
   TWILIO_ACCOUNT_SID=your_value
   TWILIO_AUTH_TOKEN=your_value
   TWILIO_PHONE_NUMBER=+1234567890
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_key
   SUPABASE_SERVICE_KEY=your_service_key
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   BACKEND_URL=https://your-backend.onrender.com
   ```

3. Click "Create Web Service"
4. Wait for deployment (3-5 minutes)
5. Copy your Backend URL (shown on page)

**Alternative: Deploy to Railway**
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Select your repo
5. Add environment variables same as above
6. Deploy

---

## API Endpoints Reference

### Upload File
```
POST /api/surveys/upload
Body: FormData with 'file' field
Response: { success: true, survey: { id, fileName, totalContacts, status } }
```

### Start Calling
```
POST /api/surveys/{surveyId}/start-calls
Response: { success: true, message, surveyId }
```

### Get Survey Details
```
GET /api/surveys/{surveyId}
Response: { survey: {...}, responses: [...] }
```

### Get Progress
```
GET /api/surveys/{surveyId}/progress
Response: { surveyId, status, totalContacts, completed, failed, pending, progress }
```

### Download Results
```
GET /api/surveys/{surveyId}/download
Response: Excel file with responses
```

### IVR Callbacks (Twilio Webhooks)
- `POST /api/ivr/greeting` - Initial greeting
- `POST /api/ivr/question1` - Handle Math 12th answer
- `POST /api/ivr/question2` - Handle Engineering interest
- `POST /api/ivr/question3` - Handle alternative course
- `POST /api/ivr/status` - Call status updates

---

## IVR Survey Flow

```
CALL INITIATED
    ↓
[Greeting] "Hello [Name], thank you for taking this survey"
    ↓
[Question 1] "Have you passed 12th from Mathematics?"
    ├─ YES (Press 1)
    │   ↓
    │   [Question 2] "Interested in Engineering?"
    │   ├─ YES (Press 1) → "Excellent! Thank you..." → HANGUP
    │   │                 [Record: Math=Yes, Engineering=Yes]
    │   │
    │   └─ NO (Press 2)
    │       ↓
    │       [Question 3] "Which course? 1=Science, 2=Commerce, 3=Arts, 4=Other"
    │       → [Record: Math=Yes, Engineering=No, Course=[Selected]]
    │       → "Thank you..." → HANGUP
    │
    └─ NO (Press 2)
        → [Record: Math=No]
        → "Thank you..." → HANGUP
```

---

## Environment Variables Cheat Sheet

### Frontend (.env.local or Vercel)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Backend (.env file)
```
# Twilio - Get from https://console.twilio.com
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Supabase - Get from https://app.supabase.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
```

---

## Database Schema

### surveys table
```sql
- id (UUID) - Primary key
- created_at (timestamp)
- updated_at (timestamp)
- file_name (text) - Original filename
- total_contacts (integer) - Number of contacts
- completed_calls (integer) - Count of completed
- failed_calls (integer) - Count of failed
- status (text) - pending/in_progress/completed
- excel_data (JSONB) - Original contact data
- responses (JSONB) - All responses
```

### responses table
```sql
- id (UUID) - Primary key
- created_at (timestamp)
- survey_id (UUID) - Foreign key to surveys
- contact_name (text) - Contact's name
- phone_number (text) - Phone number
- math_12th_passed (boolean) - Q1 answer
- engineering_interested (boolean) - Q2 answer
- alternative_course (text) - Q3 answer
- call_status (text) - pending/completed/failed
- call_duration (integer) - Duration in seconds
- error_message (text) - If call failed
```

---

## Testing the Application

### Scenario 1: Local Testing
```bash
# Terminal 1: Frontend
npm run dev
# Open http://localhost:3000

# Terminal 2: Backend
cd backend
npm run dev
# Verify http://localhost:5000/health returns { status: "ok" }
```

### Scenario 2: Test Upload
1. Create test Excel file:
   - Column A: Names (John, Jane, Bob)
   - Column B: Phone numbers (your verified numbers)
2. Upload via frontend
3. Should see "File uploaded successfully"

### Scenario 3: Test Calling
1. Click "Start Calling"
2. Within 10 seconds, phone should ring
3. Listen to greeting with your name
4. Answer questions with phone keypad (1 or 2)
5. Call ends with goodbye message
6. Check progress updates in real-time

### Scenario 4: Download Results
1. After calls complete
2. Click "Download Results"
3. Excel file contains original data + response columns

---

## Troubleshooting

### Issue: "TWILIO_ACCOUNT_SID is not set"
**Solution**: 
- Check backend .env file has the variable
- In Render, verify environment variables are set (not just in .env)
- Restart Render service after changing env vars

### Issue: "SUPABASE_URL not found"
**Solution**:
- Verify URL format: `https://xxxxx.supabase.co`
- Check if key is correct
- Verify database is accessible: Go to Supabase → Table Editor

### Issue: Excel file won't upload
**Solution**:
- Use .xlsx format (not .xls)
- Ensure Column A has names, Column B has phone numbers
- Check no empty rows at top

### Issue: Calls not being made
**Solution**:
- Verify Twilio phone number is correct and active
- Check if Twilio trial: Phone numbers must be verified
- Verify contact numbers are in valid format
- Check Render logs: Render → Logs tab

### Issue: "Frontend can't reach backend"
**Solution**:
- Verify `NEXT_PUBLIC_BACKEND_URL` environment variable in Vercel
- Ensure backend URL is correct (no trailing slash)
- Check CORS is enabled in backend (should be by default)

---

## Performance & Limits

### Free Tier Limits
- **Vercel Frontend**: Unlimited deployments, auto-scaling
- **Render Backend**: 750 hours/month free (sufficient for testing)
- **Supabase Database**: 500MB storage, 5GB egress/month
- **Twilio**: $15 free trial credit (~150 calls depending on duration)

### Concurrent Calls
- Default: 5 concurrent calls (configurable in server.js)
- Avoids overwhelming Twilio free account
- Adjust in server.js line ~250: `MAX_CONCURRENT = 5`

### Optimization Tips
- Cache responses in memory to reduce DB queries
- Batch calls to avoid rate limiting
- Clean up old results periodically
- Monitor Supabase storage usage

---

## Security Notes

### In Production
1. **Never commit .env file** - Already in .gitignore
2. **Rotate Twilio Auth Token** - Do in Twilio console after testing
3. **Enable RLS in Supabase** - Row Level Security policies (optional for demo)
4. **Use HTTPS everywhere** - Vercel + Render both use HTTPS
5. **Validate phone numbers** - Already implemented in backend
6. **Rate limiting** - Can be added to API routes

### Data Privacy
- Phone numbers are stored in Supabase
- Excel files are temporarily stored and deleted after download
- No data is sent to third parties except Twilio (for calling)
- Supabase is GDPR compliant

---

## Advanced Configuration

### Change Concurrent Calls
Edit `backend/server.js` line ~250:
```javascript
const MAX_CONCURRENT = 5; // Change this number
```

### Add New Survey Questions
Edit `backend/twilioIVR.js`:
1. Add new TwiML generation function
2. Add route handler in `server.js`
3. Update response schema in Supabase

### Customize IVR Voice
Edit `backend/twilioIVR.js`, change `voice: 'alice'` to:
- 'alice' (default, female)
- 'man' (male)
- 'woman' (female alternative)
- 'Polly.*' (AWS Polly voices)

### Add Database Persistence of Audit Logs
Add new table in `setup-database.sql`:
```sql
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT,
  survey_id UUID REFERENCES surveys(id),
  event TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Support & Issues

### Getting Help
1. **Twilio Issues**: https://support.twilio.com
2. **Supabase Issues**: https://github.com/supabase/supabase/issues
3. **Render Issues**: https://render.com/docs
4. **Vercel Issues**: https://vercel.com/help

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid credentials | Verify API keys in env vars |
| 429 Too Many Requests | Rate limit | Reduce concurrent calls |
| 413 Payload Too Large | File too big | Keep Excel under 5MB |
| 504 Gateway Timeout | Slow response | Increase timeout in frontend |
| ECONNREFUSED | Backend offline | Check Render service status |

---

## Version Information

- **Node.js**: 18+
- **Next.js**: 15.0+
- **React**: 19.0+
- **Express**: 4.18+
- **Twilio SDK**: 4.10+
- **Supabase**: 2.38+
- **PostgreSQL**: 15+ (Supabase managed)

---

## Future Enhancements

- [ ] SMS-based surveys (SMS instead of calls)
- [ ] Advanced analytics dashboard
- [ ] Custom survey questions builder
- [ ] Call recording playback
- [ ] Webhook callbacks for integrations
- [ ] Multi-language support
- [ ] Advanced filtering and segmentation
- [ ] API rate limiting and authentication
- [ ] Email notifications on completion

---

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create a GitHub issue or contact support@ivrsurvey.com

---

**Last Updated**: April 2026  
**Status**: Production Ready  
**Demo Ready**: Yes - Works out of the box with credentials
