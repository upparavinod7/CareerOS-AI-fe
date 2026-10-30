import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Bot,
  Brain,
  CheckCircle2,
  Code,
  Compass,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

export default function InterviewPrepPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const urlRole = searchParams.get("role") || "";

  const [activeTab, setActiveTab] = useState("guide"); // "guide" or "simulator"
  const [role, setRole] = useState(urlRole || user?.targetRole || "Full Stack Developer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [focusSkills, setFocusSkills] = useState((user?.skills || []).slice(0, 4).join(", ") || "react, node, sql");

  // Guide State
  const [guideData, setGuideData] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);

  // Chat Simulator State
  const [chatHistory, setChatHistory] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const handleFetchGuide = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      showError("Please enter a target role.");
      return;
    }

    setGuideLoading(true);
    try {
      const skills = focusSkills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.interviewGuidance({
        role: role.trim(),
        focusSkills: skills,
        difficulty,
      });

      setGuideData(res);
      success("Interview prep questions & study plan ready!");
    } catch (err) {
      showError(err.message || "Failed to generate interview guidance");
    } finally {
      setGuideLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!role.trim()) {
      showError("Please specify a target role first.");
      return;
    }

    setChatLoading(true);
    setChatStarted(true);
    try {
      const res = await api.chatMockInterview({
        role: role.trim(),
        messageHistory: [],
        currentAnswer: "",
      });

      setChatHistory([
        {
          role: "ai",
          content: res.reply || `Welcome to your mock interview for ${role}. Could you tell me about your technical background and experience with this stack?`,
        },
      ]);
    } catch (err) {
      showError(err.message || "Failed to start mock session");
      setChatStarted(false);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim() || chatLoading) return;

    const answerText = currentAnswer.trim();
    setCurrentAnswer("");

    const newHistory = [...chatHistory, { role: "user", content: answerText }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await api.chatMockInterview({
        role: role.trim(),
        messageHistory: newHistory,
        currentAnswer: answerText,
      });

      setChatHistory([
        ...newHistory,
        {
          role: "ai",
          content: res.reply,
          score: res.score,
          feedback: res.feedback,
        },
      ]);
    } catch (err) {
      showError(err.message || "Evaluation error");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Interview Preparation</h1>
          <p className="mt-1 text-sm text-slate-500">
            Practice technical and behavioral interview rounds with constructive STAR evaluation and scoring.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "guide" ? "bg-brand-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code size={13} />
            Question Guide
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "simulator" ? "bg-brand-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot size={13} />
            Mock Simulator
          </button>
        </div>
      </div>

      {activeTab === "guide" ? (
        /* Tab 1: Question Guide */
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Left Form: Role & Difficulty */}
          <div className="card-white p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Brain size={18} className="text-brand-700" />
              <h2 className="text-sm font-bold text-slate-900">Interview Focus Parameters</h2>
            </div>

            <form onSubmit={handleFetchGuide} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                        difficulty === lvl
                          ? "bg-brand-700 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Focus Skills / Technologies
                </label>
                <input
                  type="text"
                  placeholder="react, typescript, state management, api design..."
                  value={focusSkills}
                  onChange={(e) => setFocusSkills(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={guideLoading}
                className="btn-primary w-full text-xs py-2.5 mt-2"
              >
                {guideLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Question Guide
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output: Guide Details */}
          <div>
            {guideLoading ? (
              <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-900">Synthesizing interview questions...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Generating deep technical questions, STAR behavioral prompts, and prep plan.
                </p>
              </div>
            ) : guideData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-white p-6 space-y-6"
              >
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="badge-indigo">{guideData.role}</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {difficulty} Interview Prep Guide
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("simulator");
                      handleStartChat();
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <Bot size={13} />
                    Launch Mock Simulator
                  </button>
                </div>

                {/* Technical Questions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <Code size={15} className="text-brand-700" />
                    <span>Technical & Architectural Questions</span>
                  </div>
                  <div className="space-y-2">
                    {(guideData.technicalQuestions || guideData.technical || []).map((q, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-800 font-medium leading-relaxed">
                        <span className="font-bold text-brand-700 mr-1.5">Q{i + 1}:</span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Behavioral Questions */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <Users size={15} className="text-brand-700" />
                    <span>Behavioral & STAR Questions</span>
                  </div>
                  <div className="space-y-2">
                    {(guideData.behavioralQuestions || guideData.behavioral || []).map((q, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-800 font-medium leading-relaxed">
                        <span className="font-bold text-emerald-700 mr-1.5">STAR {i + 1}:</span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3-Day Prep Plan */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Recommended 3-Day Sprint Plan
                  </h4>
                  <div className="space-y-2 text-xs">
                    {(guideData.mockPlan || []).map((plan, i) => (
                      <div key={i} className="p-2.5 rounded bg-indigo-50/50 border border-indigo-100 text-slate-700 flex items-start gap-2">
                        <span className="badge-indigo text-[10px] shrink-0">Day {i + 1}</span>
                        <span className="text-[11px] leading-relaxed">{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <Brain size={36} className="text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-900">No Guide Generated Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Specify your target role and difficulty on the left, then click "Generate Question Guide" to prepare your technical narrative.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Interactive Mock Simulator */
        <div className="card-white p-6 space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-brand-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mock Interview Simulator</h3>
                <p className="text-[11px] text-slate-500">Target Role: {role}</p>
              </div>
            </div>

            {!chatStarted ? (
              <button onClick={handleStartChat} className="btn-primary text-xs py-1.5 px-3">
                Start Interview Session
              </button>
            ) : (
              <button
                onClick={() => {
                  setChatHistory([]);
                  setChatStarted(false);
                }}
                className="btn-secondary text-xs py-1.5 px-3 text-slate-500"
              >
                Reset Session
              </button>
            )}
          </div>

          {/* Chat Transcript Window */}
          <div className="h-[450px] overflow-y-auto soft-scroll p-4 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-4">
            {!chatStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot size={36} className="text-slate-300 mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">Ready to simulate your interview?</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  The AI interviewer will ask questions appropriate for a {role} position and score your answers on structure, technical accuracy, and measurable metrics.
                </p>
                <button onClick={handleStartChat} className="btn-primary text-xs mt-4">
                  Start Session Now
                </button>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="h-7 w-7 rounded-full bg-brand-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 shadow-xs ${
                      msg.role === "user"
                        ? "bg-brand-700 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none space-y-2"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {msg.score && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-brand-700">Answer Score: {msg.score}/10</span>
                        <span className="badge-emerald text-[10px]">Constructive Feedback</span>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              ))
            )}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Loader2 size={13} className="animate-spin text-brand-700" />
                Evaluating your response and formulating next question...
              </div>
            )}
          </div>

          {/* Chat Answer Input */}
          {chatStarted && (
            <form onSubmit={handleSendAnswer} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your interview response here (use STAR method: Situation, Task, Action, Result)..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={chatLoading}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!currentAnswer.trim() || chatLoading}
                className="btn-primary text-xs py-2 px-4"
              >
                <Send size={13} />
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
