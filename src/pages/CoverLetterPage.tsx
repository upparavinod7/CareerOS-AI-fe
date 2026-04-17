import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, FileText, Loader2, PenLine, Sparkles, Building2 } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !companyName) {
      showError("Please provide both the Target Role and Company Name.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.generateCoverLetter({
        role,
        companyName,
        jobDescription,
        resumeText: resumeText || user?.resumeText || ""
      });
      setResult(res.coverLetter);
      success("Cover letter generated perfectly.");
    } catch (error) {
       showError(error instanceof Error ? error.message : "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    success("Copied to clipboard!");
  };

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gradient flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <PenLine size={20} />
          </span>
          AI Cover Letter Generator
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create highly personalized, professional cover letters tailored instantly to your target job.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="saas-card flex flex-col h-fit"
        >
          <div className="border-b border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
               <Building2 size={18} className="text-brand-500" />
               Job Details
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Provide context to generate a highly tailored letter.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col flex-1 p-6 space-y-5">
             <div>
              <label htmlFor="companyName" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="companyName"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                Target Role <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                Target Job Description
              </label>
              <div className="mt-2">
                <textarea
                  id="jobDescription"
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here (optional) to let the AI hit key requirements..."
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="resumeText" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                Your Context <span className="text-slate-500 font-normal ml-1">(Optional)</span>
              </label>
              <div className="mt-2">
                <textarea
                  id="resumeText"
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={user?.resumeText ? "Leave blank to use your saved profile resume, or paste a specific one here." : "Paste your resume or background details here..."}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={loading || !role || !companyName}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-bold disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "Generating Draft..." : "Generate Cover Letter"}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="saas-card overflow-hidden flex flex-col"
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
               <FileText size={18} className="text-brand-500" />
               Generated Output
            </h2>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
               >
                 <Copy size={16} />
                 Copy All
               </button>
            )}
          </div>
          
          <div className="p-6 flex-1 min-h-[500px]">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                   <Loader2 size={32} className="animate-spin text-brand-500" />
                   <div className="space-y-2 text-center">
                     <p className="text-sm font-medium text-slate-900 dark:text-white">Drafting your perfect letter</p>
                     <p className="text-xs">Analyzing requirements and matching your background...</p>
                   </div>
                </div>
             ) : result ? (
               <div className="h-[600px] overflow-y-auto soft-scroll bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-full font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-sm p-8 whitespace-pre-wrap shadow-inner">
                 {result}
               </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Awaiting Instructions</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Fill out the target company and role details on the left, and let our AI craft a precise, professional cover letter tailored to your unique background.
                  </p>
                </div>
             )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
