import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Loader2, Target, TriangleAlert } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
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
      ? "bg-emerald-500"
      : safe >= 50
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
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
    <section className="mx-auto max-w-7xl lg:flex lg:gap-8">
      {/* Form Section */}
      <div className="lg:w-1/2 xl:w-5/12">
         <div className="mb-6 relative z-10">
           <h1 className="text-3xl font-extrabold tracking-tight text-gradient flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Brain size={20} />
            </span>
            Skill Analyzer
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Check your profile against a live job or any role title like ML Engineer, Data Scientist, or DevOps Engineer.
          </p>
        </div>

        <form onSubmit={onSubmit} className="saas-card p-6 border-t-4 border-t-brand-500">
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="radio" 
                name="mode" 
                value="role" 
                checked={mode === "role"} 
                onChange={() => setMode("role")}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-900 dark:text-white">Analyze by Role</span>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="radio" 
                name="mode" 
                value="job" 
                checked={mode === "job"} 
                onChange={() => setMode("job")}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-900 dark:text-white">Analyze by Job</span>
            </label>
          </div>

          <div className="space-y-5 pt-5">
            {mode === "role" ? (
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Role</label>
                <div className="mt-2 text-slate-500 dark:text-slate-400">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Be as specific as possible (e.g. Senior Backend Engineer)</p>
              </div>
            ) : (
               <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Job Posting</label>
                <div className="mt-2">
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
                    disabled={jobsLoading}
                  >
                    {jobsLoading ? <option>Loading live jobs...</option> : null}
                    {!jobsLoading && jobs.length === 0 ? <option>No jobs available in feed</option> : null}
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} - {job.company}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedJob && (
                  <div className="mt-3 rounded-md bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedJob.role}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs">
                       <span>{selectedJob.experienceLevel || "Experience not specified"}</span>
                       <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                       <span>{selectedJob.location || "Remote"}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Your Core Skills</label>
              <div className="mt-2">
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="Comma separated: react, nodejs, sql"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-slate-500">
                {quickSkills.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => {
                      if (!parsedSkills.includes(skill)) {
                        setSkillsInput((prev) => `${prev}${prev.trim() ? ", " : ""}${skill}`);
                      }
                    }}
                    className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700/50"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Years of Experience</label>
              <div className="mt-2">
                <input
                  type="number"
                  min={0}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Resume / Summary Context <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="mt-2">
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="Paste your resume summary or recent project bullet points..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-rose-50 p-4 dark:bg-rose-500/10 dark:ring-1 dark:ring-inset dark:ring-rose-500/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-rose-800 dark:text-rose-400">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-gradient-brand px-3 py-3 text-sm font-bold disabled:opacity-50 tracking-wide"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Analyzing Model...</span>
              ) : (
                <span className="flex items-center gap-2"><Target size={20} /> Generate Fit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-8 lg:mt-0 lg:w-1/2 xl:w-7/12">
        <div className="saas-card h-full min-h-[600px] p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            Analysis Report
          </h2>

          {!result ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-center p-12">
              <Target size={40} className="mx-auto text-slate-400 dark:text-slate-500" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Awaiting input</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill out the form and click "Generate Fit Report" to see your personalized AI analysis.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Target Assessed</h3>
                    {result.job ? (
                      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                        {result.job.title} <span className="font-normal text-slate-500 dark:text-slate-400">at</span> {result.job.company}
                      </p>
                    ) : (
                      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                        {result.resolvedRole || result.targetRole || "Unknown Role"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Match Score</p>
                     <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{result.matchPercentage}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ScoreBar value={result.matchPercentage} />
                </div>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg bg-emerald-50 p-5 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-900/10 dark:ring-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <CheckCircle2 size={18} />
                    <h3 className="text-sm font-semibold">Verified Strengths</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.strongSkills.length ? (
                      result.strongSkills.map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-emerald-700/70 dark:text-emerald-400/70">No direct matches currently listed.</span>
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg bg-amber-50 p-5 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-900/10 dark:ring-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <TriangleAlert size={18} />
                    <h3 className="text-sm font-semibold">Identified Gaps</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.missingSkills.length ? (
                      result.missingSkills.map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-amber-800/70 dark:text-amber-400/70">No major gaps detected.</span>
                    )}
                  </div>
                </motion.div>
              </div>

              {result.categories && result.categories.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">Skill Category Radar</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.categories}>
                        <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Skill Coverage"
                          dataKey="score"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.3}
                        />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a' }}
                           itemStyle={{ color: '#6366f1', fontWeight: 600 }}
                         />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {result.requiredSkills?.length ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-lg bg-slate-50 p-5 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Baseline Market Requirements</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.requiredSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Strategic Suggestions</h3>
                <ul className="mt-4 space-y-3">
                  {result.suggestions.map((item, index) => (
                    <li key={index} className="flex gap-x-3 text-sm leading-6 text-slate-600 dark:text-slate-300 border-l-2 border-brand-500 pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
