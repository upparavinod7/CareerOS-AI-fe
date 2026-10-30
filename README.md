# CareerOS AI — Frontend Web Application

Modern, minimalist, AI-powered career command center interface built with pure JavaScript, React 19, Vite, Tailwind CSS, Recharts, and Lucide icons.

## 1. Project Overview & UI Identity

CareerOS AI is designed following minimalist SaaS visual principles:
- **Clean Palette**: Soft off-white backgrounds (`#F8FAFC`), pure white card surfaces (`#FFFFFF`), deep indigo accent (`#3730A3` / `#4F46E5`), and subtle cool slate borders (`#E2E8F0`).
- **Sidebar**: Slim vertical sidebar with grouped sections (CAREEROS, DISCOVER, CAREER INTELLIGENCE, AI TOOLS, ACCOUNT), clear active navigation state, user profile snapshot, and responsive mobile drawer.
- **Pure JavaScript Migration**: Completely migrated from TypeScript to modern JavaScript and JSX. Zero `.ts` or `.tsx` source files remain.

```
CareerOs-AI-fe/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Slim sidebar, top breadcrumb/search, & mobile navigation
│   │   └── ProtectedRoute.jsx      # Session validation & loading guard
│   ├── context/
│   │   └── AuthContext.jsx         # User authentication state & profile synchronization
│   ├── contexts/
│   │   └── ToastContext.jsx        # Non-intrusive alert toasts (success, error, info)
│   ├── data/
│   │   └── roles.js                # Core technical role profiles & skill weightings
│   ├── hooks/
│   │   └── useAuth.js              # Authentication hook
│   ├── pages/
│   │   ├── ApplicationsPage.jsx    # Kanban Board + Table View application tracker
│   │   ├── CareerPredictorPage.jsx # AI career pathway predictor (Phase 4.5)
│   │   ├── CoverLetterPage.jsx     # AI cover letter generator & text exporter
│   │   ├── DashboardPage.jsx       # Command center KPIs, charts, & recent activities
│   │   ├── FitAnalyzerPage.jsx     # Explainable job-fit match gauge & gap analysis
│   │   ├── InterviewPrepPage.jsx   # Question guide + Interactive mock interview chat
│   │   ├── JobsPage.jsx            # Job discovery feed, bookmarks, & detail drawer
│   │   ├── LoginPage.jsx           # Minimalist authentication with password visibility toggle
│   │   ├── ProfilePage.jsx         # Full profile, career preferences, & password settings
│   │   ├── RegisterPage.jsx        # Account registration with password strength meter
│   │   ├── ResumeOptimizerPage.jsx # ATS analysis, formatting checklist, & bullet rewrites
│   │   └── RoadmapPage.jsx         # Interactive multi-week study roadmap with task toggles
│   ├── services/
│   │   ├── api.js                  # Centralized API service layer connecting to backend
│   │   └── http.js                 # Axios HTTP client with JWT interceptor & error parsing
│   ├── types/
│   │   └── index.js                # Shared constants, enums, & roles
│   ├── App.jsx                     # Route architecture & navigation tree
│   ├── index.css                   # Custom SaaS utilities, clean inputs, & badges
│   └── main.jsx                    # Application root bootstrap
├── index.html                      # HTML entrypoint pointing to /src/main.jsx
├── package.json                    # JavaScript dependencies & scripts
├── tailwind.config.js              # Minimalist theme extension & deep indigo colors
└── vite.config.js                  # Vite configuration with API proxying
```

---

## 2. Core Features & User Workflows

1. **Career Dashboard**:
   - Welcome greeting & profile readiness meter.
   - KPI metric cards: Total Applications, Jobs Discovered, Saved Bookmarks, Scheduled Interviews, Average Fit Score.
   - Application Velocity Bar Chart (Recharts) across recent weeks.
   - Recent Activities feed tracking submissions, analyses, and roadmap progress.
   - Status pipeline distribution and tactical next actions.

2. **Intelligent Job Search & Bookmarks**:
   - Real-time search by title, company, or keywords.
   - Location filtering & work type chips (Remote, Hybrid, On-site).
   - Saved bookmarks toggle: persist saved roles to user account in MongoDB.
   - Quick action drawer: Full job description, required skills, and direct action to "Analyze Job Fit", "Draft Cover Letter", or "Track in Pipeline".
   - Real-time feed synchronization trigger.

3. **Application Tracker (Pipeline Management)**:
   - **Kanban Board** + **Table View** switcher.
   - 7 standardized stages: *Interested, Applied, Assessment, Interview, Offer, Rejected, Withdrawn*.
   - Add Application modal: Link from feed job OR add custom opportunity with recruiter contact & interview schedules.
   - Status progression dropdown and application deletion.

4. **AI Job Fit Analyzer**:
   - Evaluate compatibility against feed jobs or custom role titles.
   - Explainable Match Score (0-100%).
   - Matched skills (emerald chips), partially matched (amber chips), missing skills (rose chips).
   - Competency breakdown chart across Frontend, Backend, DevOps, Data, System Design, Testing.
   - Historical analyses slideover drawer.

5. **Career Role Predictor**:
   - Interactive role recommendation engine.
   - Tailored predictions with suitability score, transferable skills, missing skills, and 12-week learning sprints.

6. **Personalized Learning Roadmap**:
   - Generates 3-phase study roadmap (Foundations, Growth, Mastery) with weekly milestones.
   - Interactive completion checkboxes updating progress dynamically in MongoDB.
   - Multiple saved roadmaps dropdown.

7. **Resume Optimizer & ATS Analyzer**:
   - ATS Readiness diagnostic (0-100 score).
   - Checklist for contact info, metrics, action verbs, and standard headers.
   - High-impact missing keywords and concrete bullet point rewrite examples.

8. **AI Cover Letter Generator**:
   - Drafts contextual cover letters using genuine user achievements and chosen writing tone (Professional, Confident, Enthusiastic, Concise).
   - In-app text editing, Copy to Clipboard, and Download as `.txt` file.
   - Saved cover letters history drawer.

9. **AI Interview Preparation**:
   - **Question Guide**: Role-specific technical questions, behavioral STAR prompts, and 3-day sprint plan by difficulty (Beginner, Intermediate, Advanced).
   - **Mock Simulator**: Simulated AI interviewer providing real-time answer evaluation, scoring (1-10), and follow-up questions.

10. **Profile & Career Preferences**:
    - Manage Full Name, Professional Headline, Bio/Objective, Target Role, and Preferred Work Type.
    - Interactive skill tag manager (add/remove skills).
    - Work experience & Education list managers.
    - Account password updates.

---

## 3. Local Setup & Execution

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Create `.env` (or `.env.local`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build Production Bundle
```bash
npm run build
```
Creates production-ready static assets in `dist/`.

### Run Lint Check
```bash
npm run lint
```
