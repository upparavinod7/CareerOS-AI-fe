import { useState } from "react";
import type { FormEvent } from "react";
import { MessageSquare, Sparkles, Code, Users, Calendar, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";

export default function InterviewPrepPage() {
  const [role, setRole] = useState("");
  const [focusSkills, setFocusSkills] = useState("");
  const [result, setResult] = useState<{ technical: string[]; behavioral: string[]; mockPlan: string[] } | null>(null);
  
  // Chat state
  const [chatMode, setChatMode] = useState(false);
  const [messageHistory, setMessageHistory] = useState<{ role: "ai" | "user", content: string, score?: number | null }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startChat = async () => {
    if (!role.trim()) {
      setError("Please provide a target role to start the mock interview.");
      return;
    }
    setError("");
    setChatMode(true);
    setChatLoading(true);
    try {
      const res = await api.chatMockInterview({ role, messageHistory: [], currentAnswer: "" });
      setMessageHistory([{ role: "ai", content: res.reply }]);
    } catch (err) {
      setError("Failed to start mock interview.");
      setChatMode(false);
    } finally {
      setChatLoading(false);
    }
  };

  const sendAnswer = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || chatLoading) return;

    const userMessage = currentAnswer;
    setCurrentAnswer("");
    const newHistory: { role: "ai" | "user", content: string, score?: number | null }[] = [
      ...messageHistory,
      { role: "user", content: userMessage }
    ];
    setMessageHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await api.chatMockInterview({ role, messageHistory: newHistory, currentAnswer: userMessage });
      setMessageHistory([
        ...newHistory.slice(0, -1),
        { role: "user", content: userMessage, score: res.score },
        { role: "ai", content: res.reply }
      ]);
    } catch (err) {
        // gracefully handle error in UI
    } finally {
      setChatLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role.trim()) {
      setError("Please provide a target role.");
      return;
    }

    setLoading(true);
    try {
      const output = await api.interviewGuidance({
        role,
        focusSkills: focusSkills.split(",").map((x) => x.trim()).filter(Boolean),
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate interview guidance.");
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
              <MessageSquare size={20} />
            </span>
            Interview Prep
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
             Generate targeted technical and behavioral questions tailored entirely to your specific role and skills.
          </p>
        </div>

        <form onSubmit={onSubmit} className="saas-card p-6 border-t-4 border-t-brand-500">
           <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Role</label>
              <div className="mt-2 text-slate-500 dark:text-slate-400">
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
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Focus Skills</label>
              <div className="mt-2 text-slate-500 dark:text-slate-400">
                <input
                  type="text"
                  value={focusSkills}
                  onChange={(e) => setFocusSkills(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="e.g. system design, node, docker"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Comma-separated. Leave blank for general role questions.</p>
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={loading || chatLoading}
              className="flex flex-1 justify-center rounded-xl bg-gradient-brand px-3 py-3 text-sm font-bold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Generating Plan...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={18} /> Generate Prep Plan</span>
              )}
            </button>

            <button
              type="button"
              onClick={startChat}
              disabled={loading || chatLoading || chatMode}
              className="flex flex-1 justify-center rounded-md bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700/50"
            >
             {chatLoading && !messageHistory.length ? (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Starting AI...</span>
              ) : (
                <span className="flex items-center gap-2"><MessageSquare size={18} /> Start Interactive AI Mock</span>
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
                Preparation Guidance
             </h2>
             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Technical + behavioral rounds.</p>
          </div>

          {!result ? (
            <div className="flex h-[500px] flex-col items-center justify-center text-center p-12">
              <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Awaiting input</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill out your role to generate your custom interview plan.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-indigo-50 p-5 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-900/10 dark:ring-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 mb-4">
                  <Code size={18} />
                  <h3 className="text-sm font-semibold">Technical Focus</h3>
                </div>
                <ul className="space-y-4">
                  {result.technical.map((item, i) => (
                    <li key={i} className="flex gap-x-3 text-sm leading-6 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-md ring-1 ring-slate-200 dark:ring-slate-700">
                      <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{i+1}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg bg-amber-50 p-5 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-900/10 dark:ring-amber-500/20">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-4">
                  <Users size={18} />
                  <h3 className="text-sm font-semibold">Behavioral Core</h3>
                </div>
                <ul className="space-y-4">
                  {result.behavioral.map((item, i) => (
                    <li key={i} className="flex gap-x-3 text-sm leading-6 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-md ring-1 ring-slate-200 dark:ring-slate-700">
                      <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-[10px] font-bold text-amber-600 dark:text-amber-400">{i+1}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg bg-emerald-50 p-5 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-900/10 dark:ring-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 mb-4">
                  <Calendar size={18} />
                  <h3 className="text-sm font-semibold">3-Day Mock Plan</h3>
                </div>
                <ul className="space-y-3">
                  {result.mockPlan.map((item, i) => (
                    <li key={i} className="flex gap-x-3 text-sm leading-6 text-emerald-900 dark:text-emerald-100 border-l-[3px] border-emerald-500 pl-3">
                      <span className="font-semibold shrink-0 w-12 text-emerald-800 dark:text-emerald-300">Day {i+1}</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

            </div>
          )}
        </div>
      </div>
      
      {/* Chat Interface Overlay or Section */}
      <AnimatePresence>
        {chatMode && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="fixed inset-4 sm:inset-10 z-50 flex flex-col saas-card overflow-hidden shadow-2xl"
           >
             <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Interviewer</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mocking {role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatMode(false)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  End Interview
                </button>
             </div>

             <div className="flex-1 overflow-y-auto soft-scroll p-6 space-y-6 bg-white dark:bg-slate-900">
                {messageHistory.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.role === 'ai' 
                        ? 'bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-800 dark:text-slate-200' 
                        : 'bg-brand-600 text-white rounded-tr-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.score !== undefined && msg.score !== null && (
                         <div className="mt-2 text-xs font-semibold bg-white/20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
                           Score: {msg.score}/10
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {chatLoading && messageHistory.length > 0 && (
                   <div className="flex justify-start">
                     <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                     </div>
                   </div>
                )}
             </div>

             <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
               <form onSubmit={sendAnswer} className="relative flex items-center">
                 <textarea
                   value={currentAnswer}
                   onChange={(e) => setCurrentAnswer(e.target.value)}
                   disabled={chatLoading}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       sendAnswer(e as any);
                     }
                   }}
                   placeholder="Type your answer here... (Press Enter to send)"
                   className="block w-full rounded-xl border-0 py-3 pl-4 pr-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400 resize-none"
                   rows={2}
                 />
                 <button
                   type="submit"
                   disabled={!currentAnswer.trim() || chatLoading}
                   className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand disabled:opacity-50"
                 >
                   <Send size={16} />
                 </button>
               </form>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
