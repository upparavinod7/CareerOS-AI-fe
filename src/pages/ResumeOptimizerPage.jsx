import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

export default function ResumeOptimizerPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const urlRole = searchParams.get("role") || "";

  const [role, setRole] = useState(urlRole || user?.targetRole || "Backend Developer");
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!role.trim() || !resumeText.trim()) {
      showError("Please provide both target role and resume text.");
      return;
    }

    setLoading(true);
    try {
      const output = await api.optimizeResume({ role, resumeText });
      setResult(output);
      success("ATS analysis & resume suggestions generated!");
    } catch (err) {
      showError(err.message || "Failed to optimize resume");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target?.result || "");
        success("Resume text loaded from file.");
      };
      reader.readAsText(file);
    } else {
      // For binary files like PDF/DOCX, explain plain text extraction
      showError("Please upload a .txt or .md file, or paste your resume content directly into the text editor.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resume Optimizer & ATS Analyzer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tailor your resume bullets, maximize ATS keyword penetration, and highlight measurable impact.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] items-start">
        {/* Left Form: Resume Input */}
        <div className="card-white p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-brand-700" />
              <h2 className="text-sm font-bold text-slate-900">Resume Context</h2>
            </div>

            {user?.resumeText && (
              <button
                type="button"
                onClick={() => setResumeText(user.resumeText)}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Load from Profile
              </button>
            )}
          </div>

          <form onSubmit={handleOptimize} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Resume Text or Bullet Points</label>
                <label className="text-brand-700 hover:underline cursor-pointer flex items-center gap-1 font-semibold text-[11px]">
                  <Upload size={11} />
                  Upload .txt file
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <textarea
                rows={11}
                required
                placeholder="Paste your current resume content, experience bullets, or summary here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none font-mono leading-relaxed"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Ensure personal contact information is formatted properly for ATS parsing.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing ATS Keyword Density...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze & Optimize Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: ATS Score & Improvement Recommendations */}
        <div>
          {loading ? (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Running ATS Diagnostic...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Scanning for contact details, measurable metrics, action verbs, and missing role keywords.
              </p>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-white p-6 space-y-6"
            >
              {/* ATS Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <span className="badge-indigo">{result.role}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    ATS Readiness Score: {result.atsScore}/100
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated against industry applicant tracking system standards.
                  </p>
                </div>

                <div className="h-16 w-16 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-indigo-50/50">
                  <span className="text-lg font-extrabold text-brand-700">{result.atsScore}%</span>
                </div>
              </div>

              {/* ATS Structural Checklist */}
              {result.atsChecklist && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    ATS Format Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                      {result.atsChecklist.hasContactSection ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      )}
                      <span>Contact Info Detected</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                      {result.atsChecklist.hasImpactMetrics ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      )}
                      <span>Quantified Metrics Included</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                      {result.atsChecklist.hasStrongActionVerbs ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      )}
                      <span>Strong Action Verbs</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                      {result.atsChecklist.hasStandardSections ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      )}
                      <span>Standard Section Headers</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Missing High-Impact Keywords */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Missing High-Impact Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(result.missingKeywords || []).slice(0, 8).map((k) => (
                    <span key={k} className="badge-rose text-xs py-1 px-2.5">
                      + {k}
                    </span>
                  ))}
                  {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                    <span className="text-xs text-slate-500">All major role keywords are covered!</span>
                  )}
                </div>
              </div>

              {/* Bullet Suggestions */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Concrete Bullet Point Suggestions
                </h4>
                <div className="space-y-2.5">
                  {(result.bulletSuggestions || []).map((sug, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2.5">
                      <Lightbulb size={15} className="text-brand-700 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <FileCheck size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Ready to Optimize</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Paste your resume text on the left and specify your target role to evaluate your ATS compatibility score and obtain bullet rewrites.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
