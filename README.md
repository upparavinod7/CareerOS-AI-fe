# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# 🚀 CareerOS AI – Intelligent Job & Career Operating System

## 🌟 Overview

**CareerOS AI** is a full-stack AI-powered job intelligence and career planning platform built using React, Node.js, and MongoDB.

Unlike traditional job portals, CareerOS AI doesn’t just show job listings — it analyzes your skills, evaluates job-fit scores, identifies skill gaps, and generates personalized roadmaps to help you land your dream job.

This project combines:

- 🔎 Real-time job search
- 🧠 AI-powered skill matching
- 📊 Career analytics dashboard
- 🗺 Personalized learning roadmap
- 💼 Job application tracking system

Built as a scalable, production-ready SaaS-style application.

---

# 🎯 Problem Statement

Most job platforms only provide listings.

They do NOT:

- Tell users how fit they are for a role
- Identify missing skills
- Suggest improvement roadmap
- Provide application tracking intelligence

CareerOS AI bridges that gap using AI-driven career analytics.

---

# 💡 Key Features

## 🔐 Authentication System

- User Registration
- Secure Login (JWT-based authentication)
- Protected Routes

---

## 🔎 Real-Time Job Search

- Fetch live jobs using external APIs (e.g., JSearch / Remotive)
- Filter by:
  - Role
  - Location
  - Salary
  - Experience

- Paginated results

---

## 🧠 AI Job Fit Analyzer

- Compare user skills with job description
- Extract keywords from job posting
- Calculate Fit Score (%)
- Highlight:
  - ✅ Strong Skills
  - ❌ Missing Skills
  - 📈 Improvement Suggestions

---

## 🗺 Personalized Roadmap Generator

- Select target role
- Enter daily study time
- Choose timeline (months)
- System generates:
  - Skill-based learning plan
  - Hour allocation
  - Structured growth path

---

## 💼 Job Application Tracker

- Save applied jobs
- Update status:
  - Applied
  - Interview
  - Rejected
  - Offer

- Track application history

---

## 📊 Career Dashboard

- Fit score trends
- Application analytics
- Skill progress tracking
- Market demand indicators

---

# 🏗 Tech Stack

## Frontend

- React (Vite)
- TypeScript
- TailwindCSS
- React Router
- Axios
- Framer Motion (UI animations)
- Recharts (analytics graphs)

## Backend

- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- REST API Architecture

## AI Logic

- Skill Matching Engine
- Fit Score Algorithm
- Keyword Extraction
- Roadmap Generation Logic

---

# 🧠 AI Logic Overview

### Fit Score Calculation

```
Fit Score = (Matched Skills / Total Required Skills) × 100
```

### Skill Gap Detection

- Extract required skills from job description
- Compare against user skill profile
- Identify missing competencies

### Roadmap Generation

- Calculate total available study hours
- Distribute across required skills
- Generate structured timeline plan

---

# 🏛 Project Architecture

```
client/
  components/
  pages/
  services/
  types/

server/
  controllers/
  routes/
  models/
  utils/
  middleware/
```

Clean modular architecture separating:

- Business logic
- API routing
- AI scoring logic
- UI components

---

# 🚀 How to Run Locally

## Backend

```bash
cd server
npm install
npm start
```

Runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd client
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

# 🌍 Future Enhancements

- 🔗 LinkedIn OAuth integration
- 📄 Resume upload & ATS optimization
- 🤖 GPT-powered resume rewriting
- 📈 Market salary trend prediction
- 📊 ML-based career prediction model
- ☁️ Cloud deployment (Vercel + Render)

---

# 🏆 Why This Project Stands Out

✔ Full-stack architecture
✔ Real-time job integration
✔ AI-powered skill intelligence
✔ Production-ready structure
✔ Scalable SaaS design
✔ Startup-level concept

This is not a simple CRUD job portal —
it is a Career Intelligence System.

---

# 👨‍💻 Author

Developed by Vinod Uppara
B.Tech CSE (AI & ML)
