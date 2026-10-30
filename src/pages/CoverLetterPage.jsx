import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  History,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { COVER_LETTER_TONES } from "../types";

export default function CoverLetterPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const urlRole = searchParams.get("role") || "";
  const urlCompany = searchParams.get("company") || "";

  const [role, setRole] = useState(urlRole || user?.targetRole || "Full Stack Developer");
  const [companyName, setCompanyName] = useState(urlCompany || "");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [tone, setTone] = useState("Professional");

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  // Past Cover Letters History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedLetters, setSavedLetters] = useState([]);

  const loadSavedLetters = async () => {
    try {
      const res = await api.getSavedCoverLetters();
      setSavedLetters(res || []);
    } catch (err) {
      console.error("Failed to load saved cover letters", err);
    }
  };

  useEffect(() => {
    loadSavedLetters();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role.trim() || !companyName.trim()) {
      showError("Please enter both target role and company name.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.generateCoverLetter({
        role: role.trim(),
        companyName: companyName.trim(),
        jobDescription,
        resumeText: resumeText || user?.resumeText || "",
        tone,
      });

      setCoverLetter(res.coverLetter);
      success("Tailored cover letter generated and saved!");
      loadSavedLetters();
    } catch (err) {
      showError(err.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    success("Cover letter copied to clipboard!");
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${companyName.replace(/\s+/g, "_") || "Job"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    success("Cover letter downloaded as .txt");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cover Letter Generator</h1>
          <p className="mt-1 text-sm text-slate-500">
            Draft tailored, professional cover letters that highlight your genuine strengths and project outcomes.
          </p>
        </div>

        {savedLetters.length > 0 && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
          >
            <History size={13} />
            Saved Letters ({savedLetters.length})
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] items-start">
        {/* Left Form: Parameters */}
        <div className="card-white p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-brand-700" />
            <h2 className="text-sm font-bold text-slate-900">Application Context</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Writing Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COVER_LETTER_TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      tone === t
                        ? "bg-brand-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Description Snippet <span className="text-slate-400 font-normal">(Optional context)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Paste key responsibilities or requirements from the job description..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resume Context / Specific Achievements
              </label>
              <textarea
                rows={4}
                placeholder="Highlight 2-3 specific project wins or skills to weave into the letter..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating Tailored Letter...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Cover Letter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Editable Cover Letter */}
        <div className="card-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PenLine size={18} className="text-brand-700" />
              <h2 className="text-sm font-bold text-slate-900">Generated Cover Letter Draft</h2>
            </div>

            {coverLetter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-xs py-1.5 px-3"
                  title="Copy to clipboard"
                >
                  <Copy size={13} />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-secondary text-xs py-1.5 px-3"
                  title="Download .txt"
                >
                  <Download size={13} />
                  Download
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Drafting tailored cover letter...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Aligning your real experience with {companyName || "the target company"}'s technical challenges.
              </p>
            </div>
          ) : coverLetter ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <textarea
                rows={18}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-xs font-mono text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 italic">
                Tip: Feel free to edit the text directly in the box above before copying or downloading.
              </p>
            </motion.div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <FileText size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">No Draft Generated Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Provide the company name and target role on the left, then click "Generate Cover Letter" to draft a tailored introduction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Saved Cover Letters Slideover */}
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
                    <h3 className="text-sm font-bold text-slate-900">Saved Cover Letters</h3>
                  </div>
                  <button onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[75vh] overflow-y-auto soft-scroll">
                  {savedLetters.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setRole(item.role);
                        setCompanyName(item.companyName);
                        setCoverLetter(item.content);
                        setHistoryOpen(false);
                      }}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.companyName}</span>
                        <span className="badge-slate text-[10px]">{item.tone || "Professional"}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.role}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}

                  {savedLetters.length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center italic">No saved cover letters yet.</p>
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
