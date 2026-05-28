# 🚀 HireAI — Complete Setup & Deployment Guide
> AI-Powered Job Portal | React + Node.js + MongoDB

---

## 📁 Project Structure

```
ai-job-portal/
├── backend/               ← Node.js + Express API
│   ├── config/db.js       ← MongoDB connection
│   ├── models/            ← User, Job, Application schemas
│   ├── controllers/       ← Business logic
│   ├── routes/            ← API endpoints
│   ├── middleware/auth.js  ← JWT + role-based auth
│   └── server.js          ← Main entry point
│
└── frontend/              ← React + Vite + TailwindCSS
    └── src/
        ├── pages/         ← All page components
        ├── components/    ← Navbar, Footer
        ├── context/       ← Zustand auth store
        └── utils/api.js   ← All API calls
```

---

## ⚙️ STEP 1: MongoDB Setup (Free — 5 mins)

1. Go to **https://mongodb.com/atlas** → Sign up free
2. Create a **Free Cluster** (M0 tier)
3. Create a **Database User** (username + password — save these!)
4. Under **Network Access** → Add IP → `0.0.0.0/0` (allow all)
5. Click **Connect** → **Connect your application** → Copy the URI
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
6. Replace `<password>` with your actual password in the URI

---

## ⚙️ STEP 2: Backend Setup

```bash
# 1. Navigate to backend folder
cd ai-job-portal/backend

# 2. Create your .env file (copy from template)
cp .env.example .env

# 3. Edit .env — fill in your values:
#    MONGO_URI = (paste your MongoDB Atlas URI here)
#    JWT_SECRET = (any long random string, e.g. "mySecretKey2024XYZ123abc")
#    PORT = 5000
#    NODE_ENV = development
#    CLIENT_URL = http://localhost:5173

# 4. Install dependencies (already done if you followed setup)
npm install

# 5. Start the backend
npm run dev
```

✅ You should see: `🚀 Server running on port 5000`
✅ Test it: Open http://localhost:5000/api/health in browser

---

## ⚙️ STEP 3: Frontend Setup

```bash
# Open a NEW terminal tab/window

# 1. Navigate to frontend folder
cd ai-job-portal/frontend

# 2. Install dependencies
npm install

# 3. Start the frontend
npm run dev
```

✅ You should see: `Local: http://localhost:5173`
✅ Open http://localhost:5173 in your browser

---

## 🌐 API Reference

### Auth Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| PUT | `/api/auth/saved-jobs/:id` | Save/unsave job | Private (seeker) |

### Jobs Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/jobs` | Get all jobs (with filters) | Public |
| GET | `/api/jobs/:id` | Get single job | Public |
| GET | `/api/jobs/skills` | Get trending skills | Public |
| GET | `/api/jobs/my-jobs` | Recruiter's own jobs | Recruiter |
| POST | `/api/jobs` | Create job | Recruiter |
| PUT | `/api/jobs/:id` | Update job | Recruiter (owner) |
| DELETE | `/api/jobs/:id` | Delete job | Recruiter (owner) |

### Applications Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/applications/:jobId` | Apply to job | Seeker |
| GET | `/api/applications/my` | My applications | Seeker |
| GET | `/api/applications/seeker-stats` | Seeker dashboard stats | Seeker |
| GET | `/api/applications/job/:jobId` | Job's applications | Recruiter |
| GET | `/api/applications/recruiter-stats` | Recruiter dashboard | Recruiter |
| PUT | `/api/applications/:id/status` | Update app status | Recruiter |
| PUT | `/api/applications/:id/withdraw` | Withdraw application | Seeker |

---

## 🚀 DEPLOYMENT

### Backend → Railway (Free)
1. Go to **https://railway.app** → Login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo → Choose the `backend` folder
4. Add **Environment Variables** (same as your .env):
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production
   - `CLIENT_URL` = your Vercel frontend URL (add after step below)
5. Railway gives you a URL like: `https://hireai-backend.railway.app`

### Frontend → Vercel (Free)
1. Go to **https://vercel.com** → Login with GitHub
2. Click **New Project** → Import your repo
3. Set **Root Directory** to `frontend`
4. Add **Environment Variable**:
   - `VITE_API_URL` = your Railway backend URL
5. In `frontend/src/utils/api.js`, change `baseURL: "/api"` to:
   ```js
   baseURL: import.meta.env.VITE_API_URL + "/api"
   ```
6. Deploy → Vercel gives you: `https://hireai.vercel.app`

---

## 🤖 AI TOOLS TO ENHANCE YOUR PROJECT

### For UI Design
- **v0.dev** (by Vercel) — Type what UI you want, get React code
- **Galileo AI** — Generate beautiful UI designs from text
- **Framer AI** — AI-powered website builder

### For Backend & Database
- **Supabase** — PostgreSQL alternative with built-in auth (if you want to switch from MongoDB)
- **PlanetScale** — MySQL database with free tier
- **Neon** — Serverless PostgreSQL

### For Code Help
- **GitHub Copilot** — AI autocomplete in VS Code
- **Cursor** — AI-first code editor (best for this project)
- **Continue.dev** — Free GitHub Copilot alternative

### For Testing APIs
- **Postman** — Test all your API endpoints visually
- **Hoppscotch** — Free, browser-based API tester

### For Monitoring (Production)
- **Sentry** — Error tracking (free tier)
- **LogRocket** — Frontend session recording
- **UptimeRobot** — Monitor if your server is down (free)

---

## 📝 FEATURES CHECKLIST

### ✅ Completed
- [x] User registration (Job Seeker & Recruiter roles)
- [x] JWT authentication with role-based access
- [x] Job posting with full details (skills, salary, perks)
- [x] Advanced job search & filtering
- [x] One-click job application with cover letter
- [x] Application tracking with status history
- [x] Recruiter application management dashboard
- [x] Save/bookmark jobs
- [x] Profile management with skills
- [x] Password change
- [x] Responsive mobile UI
- [x] Animations throughout
- [x] Rate limiting & security headers

### 🔮 Future Features to Add
- [ ] Email notifications (use Nodemailer + Gmail)
- [ ] Resume upload (use Cloudinary)
- [ ] AI-powered job recommendations
- [ ] Video interview scheduling
- [ ] Company reviews
- [ ] Real-time chat (Socket.io)
- [ ] PDF resume parser

---

## 🛠 RECOMMENDED VS CODE EXTENSIONS
- **ES7 React/Redux Snippets** — Quick React component shortcuts
- **Tailwind CSS IntelliSense** — Autocomplete for Tailwind classes
- **Thunder Client** — Test APIs right in VS Code
- **Prettier** — Auto-format your code
- **GitLens** — Better Git integration

---

## 💡 QUICK TIPS

**To add sample job data for testing:**
Use Postman or Thunder Client to POST to `/api/jobs` with a recruiter JWT token.

**To run both servers at once:**
Install `concurrently` in the root folder and add a root `package.json` with:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
  }
}
```

**JWT Token usage:**
After login, the token is auto-saved in localStorage as `hireai_token` and sent with every request automatically.
