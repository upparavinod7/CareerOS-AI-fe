import http from "./http";

export const api = {
  // Authentication
  register: (payload) =>
    http.post("/auth/register", payload).then((r) => r.data),

  login: (payload) =>
    http.post("/auth/login", payload).then((r) => r.data),

  // User Profile
  me: () =>
    http.get("/users/me").then((r) => r.data.user || r.data),

  updateProfile: (payload) =>
    http.patch("/users/me", payload).then((r) => r.data.user || r.data),

  changePassword: (payload) =>
    http.post("/users/change-password", payload).then((r) => r.data),

  // Job Search & Saved Jobs
  searchJobs: (params) =>
    http.get("/jobs", { params }).then((r) => r.data),

  getJob: (id) =>
    http.get(`/jobs/${id}`).then((r) => r.data.job || r.data),

  saveJob: (id) =>
    http.post(`/jobs/${id}/save`).then((r) => r.data),

  unsaveJob: (id) =>
    http.delete(`/jobs/${id}/save`).then((r) => r.data),

  getSavedJobs: () =>
    http.get("/jobs/saved").then((r) => r.data.items || r.data),

  syncJobsNow: () =>
    http.post("/jobs/sync").then((r) => r.data),

  getJobSyncStatus: () =>
    http.get("/jobs/sync/status").then((r) => r.data),

  streamJobsUrl: () => {
    const base = http.defaults.baseURL || "/api/v1";
    return `${base}/jobs/stream`;
  },

  // Applications
  listApplications: (params) =>
    http.get("/applications", { params }).then((r) => r.data),

  createApplication: (payload) =>
    http.post("/applications", payload).then((r) => r.data.data || r.data),

  updateApplication: (id, payload) =>
    http.patch(`/applications/${id}`, payload).then((r) => r.data.data || r.data),

  deleteApplication: (id) =>
    http.delete(`/applications/${id}`).then((r) => r.data),

  // Dashboard
  dashboard: () =>
    http.get("/dashboard").then((r) => r.data),

  // AI Fit Analyzer
  analyzeFit: (payload) =>
    http.post("/ai/fit", payload).then((r) => r.data),

  analyzeRoleFit: (payload) =>
    http.post("/ai/fit-role", payload).then((r) => r.data),

  getFitHistory: () =>
    http.get("/ai/fit-history").then((r) => r.data.history || r.data),

  // Career Role Predictor (Phase 4.5)
  predictCareer: (payload) =>
    http.post("/ai/career-predict", payload).then((r) => r.data),

  // Learning Roadmap
  roadmap: (payload) =>
    http.post("/ai/roadmap", payload).then((r) => r.data.roadmap || r.data),

  getRoadmaps: () =>
    http.get("/ai/roadmaps").then((r) => r.data.items || r.data),

  toggleRoadmapTask: (roadmapId, taskId) =>
    http.patch(`/ai/roadmaps/${roadmapId}/tasks/${taskId}`).then((r) => r.data),

  // Resume Optimizer & ATS
  optimizeResume: (payload) =>
    http.post("/ai/resume-optimize", payload).then((r) => r.data),

  // Interview Preparation
  interviewGuidance: (payload) =>
    http.post("/ai/interview-guidance", payload).then((r) => r.data),

  chatMockInterview: (payload) =>
    http.post("/ai/chat-mock-interview", payload).then((r) => r.data),

  // Cover Letter
  generateCoverLetter: (payload) =>
    http.post("/ai/cover-letter", payload).then((r) => r.data),

  getSavedCoverLetters: () =>
    http.get("/ai/cover-letters").then((r) => r.data.items || r.data),
};

export default api;

