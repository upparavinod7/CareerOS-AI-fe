import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  History,
  Layers,
  Loader2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

export default function FitAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const urlJobId = searchParams.get("jobId") || "";

  // Form State
  const [mode, setMode] = useState(urlJobId ? "job" : "role"); // "job" or "role"
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(urlJobId);
  const [roleInput, setRoleInput] = useState(user?.targetRole || "Full Stack Developer");
  const [skillsInput, setSkillsInput] = useState((user?.skills || []).join(", ") || "react, node, sql, javascript");
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 2);

  // Analysis Result
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Past Analyses History Drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    // Load available jobs for selection
    api.searchJobs({ page: 1, limit: 30, sort: "recent" })
      .then((res) => {
        setJobs(res.items || []);
        if (urlJobId) {
          setSelectedJobId(urlJobId);
          setMode("job");
        } else if (res.items?.length > 0) {
          setSelectedJobId((prev) => prev || res.items[0]._id);
        }
      })
      .catch(() => {});

    // Load past fit history
    api.getFitHistory()
      .then((data) => setHistoryList(data || []))
      .catch(() => {});
  }, [urlJobId]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedSkills = skillsInput
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      let res;
      if (mode === "job") {
        if (!selectedJobId) {
          showError("Please select a target job to analyze.");
          setLoading(false);
          return;
        }
        res = await api.analyzeFit({
          jobId: selectedJobId,
          skills: parsedSkills,
          resumeText,
          experienceYears: Number(experienceYears) || 0,
        });
      } else {
        if (!roleInput.trim()) {
          showError("Target role title is required.");
          setLoading(false);
          return;
        }
        res = await api.analyzeRoleFit({
          role: roleInput.trim(),
          skills: parsedSkills,
          resumeText,
          experienceYears: Number(experienceYears) || 0,
        });
      }

      setResult(res);
      success("Job fit analysis computed successfully!");

      // Refresh history list
      api.getFitHistory().then((d) => setHistoryList(d || []));
    } catch (err) {
      showError(err.message || "Fit analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedJobDetails = useMemo(() => {
    return jobs.find((j) => j._id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Job Fit Analyzer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare your profile against actual job postings to uncover matching strengths and skill gaps.
          </p>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
        >
          <History size={13} />
          Analysis History ({historyList.length})
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] items-start">
        {/* Left Form: Inputs */}
        <div className="card-white p-6 space-y-5">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("job")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === "job" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Analyze Specific Job
            </button>
            <button
              type="button"
              onClick={() => setMode("role")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === "role" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Analyze Role Title
            </button>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            {mode === "job" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Posting</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} — {job.company} ({job.location})
                    </option>
                  ))}
                </select>

                {selectedJobDetails && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">{selectedJobDetails.company}</p>
                    <p className="mt-0.5 line-clamp-2">{selectedJobDetails.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Developer, AI/ML Engineer"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Your Current Skills (Comma-separated)</label>
                {user?.skills?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSkillsInput(user.skills.join(", "))}
                    className="text-[10px] font-semibold text-brand-700 hover:underline"
                  >
                    Load from Profile
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                placeholder="react, typescript, node, express, sql, docker..."
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-xs py-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Run Fit Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resume Content <span className="text-slate-400 font-normal">(Optional context for keywords)</span>
              </label>
              <textarea
                rows={5}
                placeholder="Paste key resume bullet points or summary to enhance keyword matching..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>
          </form>
        </div>

        {/* Right Output: Analysis Results */}
        <div>
          {loading ? (
            <div className="card-white p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Evaluating compatibility...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Comparing required tech stack, keyword coverage, and domain requirements.
              </p>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-white p-6 space-y-6"
            >
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <span className="badge-indigo">
                    {result.resolvedRole || result.job?.title || "Role Analysis"}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    {result.matchPercentage}% Compatibility Score
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result.experienceAlignment || "Calculated using weighted skill requirements"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-indigo-50/50">
                    <span className="text-lg font-extrabold text-brand-700">
                      {result.matchPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Categorization Breakdown */}
              <div className="space-y-4">
                {/* Strong Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Strong Matched Skills ({(result.strongSkills || []).length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.strongSkills || []).length > 0 ? (
                      result.strongSkills.map((s) => (
                        <span key={s} className="badge-emerald text-xs py-1 px-2.5">
                          ✓ {s.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None identified</span>
                    )}
                  </div>
                </div>

                {/* Partially Matching / Inferred */}
                {(result.partiallyMatchingSkills || []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Partially Matched / Resume Mentioned ({result.partiallyMatchingSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.partiallyMatchingSkills.map((s) => (
                        <span key={s} className="badge-amber text-xs py-1 px-2.5">
                          ~ {s.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                    <AlertCircle size={14} className="text-rose-500" />
                    <span>Missing Skills to Acquire ({(result.missingSkills || []).length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingSkills || []).length > 0 ? (
                      result.missingSkills.map((s) => (
                        <span key={s} className="badge-rose text-xs py-1 px-2.5">
                          ✕ {s.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Full stack alignment achieved!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Competency Chart */}
              {result.categories && result.categories.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Competency Breakdown
                  </h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.categories} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                        <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            borderColor: "#E2E8F0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="score" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Improvement Plan
                </h4>
                {(result.suggestions || []).map((sug, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <ArrowRight size={13} className="text-brand-700 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>

              {/* Next Action Links */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate(`/roadmap?role=${encodeURIComponent(result.resolvedRole || roleInput)}`)}
                  className="btn-primary text-xs py-2 px-3.5"
                >
                  <Compass size={13} />
                  Generate Learning Roadmap
                </button>
                <button
                  onClick={() => navigate(`/resume?role=${encodeURIComponent(result.resolvedRole || roleInput)}`)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  <FileText size={13} />
                  Optimize Resume for Role
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Sparkles size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Ready to Analyze</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose a job from the board or specify a target role on the left, then click "Run Fit Analysis" to view your compatibility score and gaps.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis History Slideover Modal */}
      <AnimatePresence>
        {historyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="bg-white h-full w-full max-w-md shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-brand-700" />
                    <h3 className="text-sm font-bold text-slate-900">Past Analysis History</h3>
                  </div>
                  <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[75vh] overflow-y-auto soft-scroll">
                  {historyList.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setResult({
                          resolvedRole: item.role,
                          matchPercentage: item.fitScore,
                          strongSkills: item.strongSkills,
                          missingSkills: item.missingSkills,
                          partiallyMatchingSkills: item.partiallyMatchingSkills,
                          suggestions: item.suggestions,
                          categories: item.categoryScores,
                          experienceAlignment: item.experienceAlignment,
                        });
                        setHistoryOpen(false);
                      }}
                      className="p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{item.role}</span>
                        <span className="text-xs font-extrabold text-brand-700">{item.fitScore}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {historyList.length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center italic">No past analyses saved yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
