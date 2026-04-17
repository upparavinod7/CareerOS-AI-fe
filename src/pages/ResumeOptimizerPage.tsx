import { useState } from "react";
import type { FormEvent } from "react";
import { FileText, Sparkles, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import type { ResumeSuggestion } from "../types";

export default function ResumeOptimizerPage() {
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ResumeSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!role.trim() || !resumeText.trim()) {
      setError("Please provide both target role and resume text.");
      return;
    }

    setLoading(true);
    try {
      const output = await api.optimizeResume({ role, resumeText });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimize resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl lg:flex lg:gap-8">
      {/* Form Section */}
      <div className="lg:w-1/2 xl:w-5/12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <FileText size={20} />
            </span>
            Resume Optimizer
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tailor your resume for specific roles to beat ATS systems and stand out.
          </p>
        </div>

        <form onSubmit={onSubmit} className="saas-card p-6 border-t-4 border-t-brand-500">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Role</label>
              <div className="mt-2">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="e.g. Backend Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Resume Content</label>
              <div className="mt-2 text-slate-500 dark:text-slate-400">
                <textarea
                  rows={10}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="Paste your current resume bullets or full text..."
                />
              </div>
               <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ensure any personal information is removed before analyzing.</p>
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
              className="flex w-full justify-center rounded-md bg-brand-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Optimizing text...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={20} /> Analyze & Optimize</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-8 lg:mt-0 lg:w-1/2 xl:w-7/12">
        <div className="saas-card h-full min-h-[600px] bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
             <h2 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
                ATS Optimizer Report
             </h2>
             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Suggestions to improve your parse rate.</p>
          </div>

          {!result ? (
            <div className="flex h-[500px] flex-col items-center justify-center text-center p-12">
              <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Awaiting input</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill out the role and resume text on the left to get formatting and keyword suggestions.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-amber-50 p-5 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-900/10 dark:ring-amber-500/20">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-3">
                  <AlertTriangle size={18} />
                  <h3 className="text-sm font-semibold">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.length ? result.missingKeywords.map(kw => (
                    <span key={kw} className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                      {kw}
                    </span>
                  )) : (
                     <span className="text-sm text-amber-800/70 dark:text-amber-400/70">None detected! Your keyword coverage is excellent.</span>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg bg-emerald-50 p-5 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-900/10 dark:ring-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-3">
                  <Sparkles size={18} />
                  <h3 className="text-sm font-semibold">Bullet Improvements</h3>
                </div>
                <ul className="space-y-3">
                  {result.bulletSuggestions.length ? result.bulletSuggestions.map((item, i) => (
                    <li key={i} className="flex gap-x-3 text-sm leading-6 text-emerald-900 dark:text-emerald-100 border-l-2 border-emerald-500 pl-3">
                      {item}
                    </li>
                  )) : (
                     <li className="text-sm text-emerald-800/70 dark:text-emerald-400/70">Your bullets look great! No major phrasing improvements suggested.</li>
                  )}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                  <CheckCircle2 size={18} className="text-brand-500" />
                  <h3 className="text-sm font-semibold">ATS Parsing Checklist</h3>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Section detected</span>
                    {result.atsChecklist.hasContactSection ? <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} /></span> : <span className="text-amber-600 dark:text-amber-400"><AlertTriangle size={18} /></span>}
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Projects Section detected</span>
                    {result.atsChecklist.hasProjectsSection ? <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} /></span> : <span className="text-amber-600 dark:text-amber-400"><AlertTriangle size={18} /></span>}
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Impact Metrics (Numbers)</span>
                    {result.atsChecklist.hasImpactMetrics ? <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} /></span> : <span className="text-amber-600 dark:text-amber-400"><AlertTriangle size={18} /></span>}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
