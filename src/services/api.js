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

  // Resume Optimizer & ATS Intelligence
  optimizeResume: (payload) =>
    http.post("/ai/resume-optimize", payload).then((r) => r.data),

  parseResumeDoc: (payload) =>
    http.post("/ai/resume/parse", payload).then((r) => r.data),

  qualityCheckResume: (resume) =>
    http.post("/ai/resume/quality-check", { resume }).then((r) => r.data),

  scoreATSCompatibility: (payload) =>
    http.post("/ai/resume/ats-score", payload).then((r) => r.data),

  optimizeResumeIntelligence: (payload) =>
    http.post("/ai/resume/optimize", payload).then((r) => r.data),

  generateResumePDF: (resume) =>
    http.post("/ai/resume/generate-pdf", { resume }, { responseType: "blob" }).then((r) => r.data),

  validateResumePDF: (resume) =>
    http.post("/ai/resume/validate-pdf", { resume }).then((r) => r.data),

  getSavedResumeAudits: () =>
    http.get("/ai/resume/saved").then((r) => r.data.items || r.data),

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

  // Connected Accounts & Integrations
  getIntegrations: () =>
    http.get("/integrations").then((r) => r.data.data || r.data),

  getConnectedAccounts: () =>
    http.get("/integrations/accounts").then((r) => r.data.data || r.data),

  getConnectUrl: (provider) =>
    http.get(`/integrations/${provider}/connect`).then((r) => r.data.data || r.data),

  connectAccount: (provider, payload) =>
    http.post(`/integrations/${provider}/callback`, payload).then((r) => r.data.data || r.data),

  disconnectAccount: (provider) =>
    http.delete(`/integrations/${provider}`).then((r) => r.data),

  // Multi-Resume Versions
  listResumes: () =>
    http.get("/users/resumes").then((r) => r.data.data || r.data),

  addResume: (payload) =>
    http.post("/users/resumes", payload).then((r) => r.data.data || r.data),

  setDefaultResume: (id) =>
    http.patch(`/users/resumes/${id}/default`).then((r) => r.data.data || r.data),

  deleteResume: (id) =>
    http.delete(`/users/resumes/${id}`).then((r) => r.data),

  // Auto Apply Agent
  getAutoApplyOverview: () =>
    http.get("/auto-apply/overview").then((r) => r.data.data || r.data),

  syncAutoApplyJobs: () =>
    http.post("/auto-apply/sync").then((r) => r.data.data || r.data),

  autoRunAutoApply: () =>
    http.post("/auto-apply/auto-run").then((r) => r.data.data || r.data),

  getAutoApplyJobs: (params) =>
    http.get("/auto-apply/jobs", { params }).then((r) => r.data.data || r.data),

  getAutoApplyQueue: () =>
    http.get("/auto-apply/queue").then((r) => r.data.data || r.data),

  prepareAutoApply: (jobId) =>
    http.post("/auto-apply/prepare", { jobId }).then((r) => r.data.data || r.data),

  approveAutoApply: (id, notes) =>
    http.post(`/auto-apply/${id}/approve`, { notes }).then((r) => r.data.data || r.data),

  updateAutoApplyAnswers: (id, payload) =>
    http.patch(`/auto-apply/${id}/answers`, payload).then((r) => r.data.data || r.data),

  submitAutoApply: (id) =>
    http.post(`/auto-apply/${id}/submit`).then((r) => r.data),

  confirmGuidedAutoApply: (id, payload) =>
    http.post(`/auto-apply/${id}/confirm-guided`, payload).then((r) => r.data.data || r.data),

  rejectAutoApply: (id, reason) =>
    http.post(`/auto-apply/${id}/reject`, { reason }).then((r) => r.data.data || r.data),

  getAutoApplyHistory: () =>
    http.get("/auto-apply/history").then((r) => r.data.data || r.data),

  getAutoApplySettings: () =>
    http.get("/auto-apply/settings").then((r) => r.data.data || r.data),

  updateAutoApplySettings: (payload) =>
    http.patch("/auto-apply/settings", payload).then((r) => r.data.data || r.data),
};

export default api;

