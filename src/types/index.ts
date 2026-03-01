export type User = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experienceYears: number;
  targetRole: string;
  resumeText?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  role: string;
  experienceLevel: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  description: string;
  skills: string[];
  sourcePlatform: string;
  sourceLabel: string;
  sourceUrl: string;
  demandScore: number;
  postedAt: string;
  syncedAt: string;
};

export type JobsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Job[];
  realtime?: {
    connectedClients: number;
    sync: JobSyncStatus;
  };
};

export type JobSyncStatus = {
  running: boolean;
  lastSyncAt: string | null;
  lastResult: {
    fetched: number;
    inserted: number;
    updated: number;
    totalActive: number;
    durationMs: number;
    failures: Array<{ source: string; message: string }>;
  } | null;
  totalActiveJobs?: number;
  connectedClients?: number;
};

export type FitResult = {
  job?: { id: string; title: string; company: string; role: string };
  targetRole?: string;
  resolvedRole?: string;
  roleMatchConfidence?: number;
  requiredSkills?: string[];
  matchPercentage: number;
  strongSkills: string[];
  missingSkills: string[];
  suggestions: string[];
};

export type Roadmap = {
  role: string;
  resolvedRole?: string;
  roleMatchConfidence?: number;
  hoursPerDay: number;
  months: number;
  totalHours: number;
  totalWeeks: number;
  phases: Array<{
    name: string;
    durationWeeks: number;
    focus: string;
    milestone: string;
    skills: string[];
  }>;
  timeline: Array<{
    skill: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    allocatedHours: number;
    startWeek: number;
    endWeek: number;
    milestone: string;
    resources: string[];
  }>;
  weeklyPlan: Array<{
    week: number;
    focus: string;
    hours: number;
    deliverable: string;
  }>;
  recommendations: string[];
};

export type ResumeSuggestion = {
  role: string;
  missingKeywords: string[];
  bulletSuggestions: string[];
  atsChecklist: {
    hasContactSection: boolean;
    hasProjectsSection: boolean;
    hasImpactMetrics: boolean;
  };
};

export type Application = {
  _id: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  notes: string;
  job: Job;
  appliedAt: string;
  updatedAt: string;
};

export type DashboardData = {
  fitHistory: Array<{
    _id: string;
    role: string;
    fitScore: number;
    missingSkills?: string[];
    createdAt: string;
  }>;
  fitSummary: {
    last: number;
    best: number;
    average: number;
  };
  applicationsCount: number;
  statusBreakdown: Record<string, number>;
  recentApplications: Array<{
    id: string;
    status: "Applied" | "Interview" | "Rejected" | "Offer";
    appliedAt: string;
    job: null | {
      id: string;
      title: string;
      company: string;
      role: string;
      location: string;
      sourcePlatform: string;
    };
  }>;
  pipelineVelocity: Array<{ label: string; count: number }>;
  topMissingSkills: string[];
  marketDemand: Array<{
    _id: string;
    title: string;
    role: string;
    demandScore: number;
    location: string;
  }>;
};
