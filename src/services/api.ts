import http from "./http";
import type {
  Application,
  AuthResponse,
  DashboardData,
  FitResult,
  Job,
  JobsResponse,
  JobSyncStatus,
  ResumeSuggestion,
  Roadmap,
  User,
} from "../types";

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    http.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    http.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  me: () => http.get<{ user: User }>("/users/me").then((r) => r.data.user),

  updateProfile: (payload: Partial<User>) =>
    http.patch<{ user: User }>("/users/me", payload).then((r) => r.data.user),

  searchJobs: (params: Record<string, string | number | undefined>) =>
    http.get<JobsResponse>("/jobs", { params }).then((r) => r.data),

  syncJobsNow: () => http.post("/jobs/sync").then((r) => r.data),

  getJobSyncStatus: () =>
    http.get<JobSyncStatus>("/jobs/sync/status").then((r) => r.data),

  streamJobsUrl: () => `${http.defaults.baseURL || ""}/jobs/stream`,

  getJob: (id: string) => http.get<Job>(`/jobs/${id}`).then((r) => r.data),

  analyzeFit: (payload: {
    jobId: string;
    skills: string[];
    resumeText: string;
    experienceYears: number;
  }) => http.post<FitResult>("/ai/fit", payload).then((r) => r.data),

  analyzeRoleFit: (payload: {
    role: string;
    skills: string[];
    resumeText: string;
    experienceYears: number;
  }) => http.post<FitResult>("/ai/fit-role", payload).then((r) => r.data),

  roadmap: (payload: { role: string; hoursPerDay: number; months: number }) =>
    http.post<Roadmap>("/ai/roadmap", payload).then((r) => r.data),

  optimizeResume: (payload: { resumeText: string; role: string }) =>
    http
      .post<ResumeSuggestion>("/ai/resume-optimize", payload)
      .then((r) => r.data),

  interviewGuidance: (payload: { role: string; focusSkills: string[] }) =>
    http
      .post<{
        technical: string[];
        behavioral: string[];
        mockPlan: string[];
      }>("/ai/interview-guidance", payload)
      .then((r) => r.data),

  dashboard: () => http.get<DashboardData>("/dashboard").then((r) => r.data),

  listApplications: () =>
    http.get<Application[]>("/applications").then((r) => r.data),

  createApplication: (payload: { jobId: string; notes?: string }) =>
    http.post<Application>("/applications", payload).then((r) => r.data),

  updateApplication: (
    id: string,
    payload: { status: string; notes?: string },
  ) =>
    http.patch<Application>(`/applications/${id}`, payload).then((r) => r.data),
};
