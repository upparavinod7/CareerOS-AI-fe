import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Loader2, Target, TriangleAlert } from "lucide-react";
import { api } from "../services/api";
import type { FitResult, Job } from "../types";

const quickSkills = [
  "node",
  "react",
  "typescript",
  "python",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "system_design",
  "ml",
];

type AnalyzeMode = "job" | "role";

function ScoreBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  const color =
    safe >= 75
      ? "from-emerald-400 to-teal-400"
      : safe >= 50
        ? "from-amber-400 to-orange-400"
        : "from-rose-400 to-pink-400";

  return (
    <div className="mt-3 h-3 w-full rounded-full bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`h-3 rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

export default function FitAnalyzerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mode, setMode] = useState<AnalyzeMode>("role");
  const [jobId, setJobId] = useState("");
  const [roleInput, setRoleInput] = useState("ML Engineer");
  const [skillsInput, setSkillsInput] = useState("python,ml,sql");
  const [resumeText, setResumeText] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [result, setResult] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedJob = useMemo(() => jobs.find((job) => job._id === jobId) || null, [jobs, jobId]);

  useEffect(() => {
    setJobsLoading(true);
    api.searchJobs({ page: 1, limit: 20, sort: "demand" })
      .then((res) => {
        setJobs(res.items);
        if (res.items.length > 0) {
          setJobId((prev) => prev || res.items[0]._id);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  const parsedSkills = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [skillsInput],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parsedSkills.length) {
      setError("Add at least one skill.");
      return;
    }

    if (mode === "job" && !jobId) {
      setError("Select a target job first.");
      return;
    }

    if (mode === "role" && !roleInput.trim()) {
      setError("Enter a target role first.");
      return;
    }

    setLoading(true);
    try {
      const output =
        mode === "job"
          ? await api.analyzeFit({
              jobId,
              skills: parsedSkills,
              resumeText,
              experienceYears,
            })
          : await api.analyzeRoleFit({
              role: roleInput,
              skills: parsedSkills,
              resumeText,
              experienceYears,
            });

      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fit analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-5">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Brain size={18} className="text-cyan-300" />
          Skill Analyzer
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Check your profile against a live job or any role title like ML Engineer, Data Scientist, or DevOps Engineer.
        </p>

        <div className="mt-4 inline-flex rounded-xl border border-white/10 bg-black/20 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("role")}
            className={`rounded-lg px-3 py-1.5 transition ${mode === "role" ? "bg-cyan-300 text-slate-900" : "text-slate-300 hover:bg-white/10"}`}
          >
            Analyze by Role
          </button>
          <button
            type="button"
            onClick={() => setMode("job")}
            className={`rounded-lg px-3 py-1.5 transition ${mode === "job" ? "bg-cyan-300 text-slate-900" : "text-slate-300 hover:bg-white/10"}`}
          >
            Analyze by Job
          </button>
        </div>

        {mode === "role" ? (
          <>
            <label className="mt-4 block text-sm text-slate-300">Target Role</label>
            <input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
              placeholder="ML Engineer"
            />
            <p className="mt-1 text-xs text-slate-500">Example: ML Engineer, Backend Developer, Data Scientist, DevOps Engineer</p>
          </>
        ) : (
          <>
            <label className="mt-4 block text-sm text-slate-300">Target Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
              disabled={jobsLoading}
            >
              {jobsLoading ? <option>Loading jobs...</option> : null}
              {!jobsLoading && jobs.length === 0 ? <option>No jobs found</option> : null}
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>

            {selectedJob ? (
              <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
                <p className="font-medium text-slate-200">{selectedJob.role} - {selectedJob.experienceLevel}</p>
                <p className="mt-1">{selectedJob.location}</p>
              </div>
            ) : null}
          </>
        )}

        <label className="mt-4 block text-sm text-slate-300">Your Skills (comma separated)</label>
        <input
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
          placeholder="python, ml, sql"
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              onClick={() => {
                if (!parsedSkills.includes(skill)) {
                  setSkillsInput((prev) => `${prev}${prev.trim() ? ", " : ""}${skill}`);
                }
              }}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10"
            >
              + {skill}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm text-slate-300">Experience (years)</label>
        <input
          type="number"
          min={0}
          value={experienceYears}
          onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
        />

        <label className="mt-4 block text-sm text-slate-300">Resume Snippet (optional)</label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="mt-1 h-28 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
          placeholder="Paste summary or recent project bullets..."
        />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
          {loading ? "Analyzing..." : "Analyze Fit"}
        </button>
      </form>

      <article className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white">Fit Result</h2>
        {!result ? (
          <p className="mt-3 text-sm text-slate-400">Run analysis to view fit score, strengths, gaps, and recommendations.</p>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
              {result.job ? (
                <p>
                  Target: <span className="font-medium text-white">{result.job.title}</span> at {result.job.company}
                </p>
              ) : (
                <p>
                  Target Role: <span className="font-medium text-white">{result.resolvedRole || result.targetRole || "Unknown"}</span>
                </p>
              )}
              {typeof result.roleMatchConfidence === "number" ? (
                <p className="mt-1 text-xs text-slate-400">Role match confidence: {Math.round(result.roleMatchConfidence * 100)}%</p>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Match Score</p>
                <p className="text-2xl font-bold text-white">{result.matchPercentage}%</p>
              </div>
              <ScoreBar value={result.matchPercentage} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3">
                <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-200">
                  <CheckCircle2 size={14} />
                  Strong Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strongSkills.length ? (
                    result.strongSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-100">{skill}</span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-100/80">No direct matches yet</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 p-3">
                <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-amber-200">
                  <TriangleAlert size={14} />
                  Missing Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.length ? (
                    result.missingSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-100">{skill}</span>
                    ))
                  ) : (
                    <span className="text-xs text-amber-100/80">No major skill gaps detected</span>
                  )}
                </div>
              </div>
            </div>

            {result.requiredSkills?.length ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm font-medium text-slate-200">Role Skill Baseline</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.requiredSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-500/20 px-2 py-1 text-xs text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-sm font-medium text-slate-200">Improvement Suggestions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {result.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
