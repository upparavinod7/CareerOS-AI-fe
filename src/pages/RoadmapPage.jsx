import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  History,
  Layers,
  Lightbulb,
  Loader2,
  Map,
  Plus,
  Route,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

const commonRoles = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI/ML Engineer",
  "Generative AI / LLM Engineer",
  "DevOps / Cloud Engineer",
  "Data Scientist",
  "AI Agent Developer",
];

export default function RoadmapPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const urlRole = searchParams.get("role") || "";

  const [roleInput, setRoleInput] = useState(urlRole || user?.targetRole || "Full Stack Developer");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [months, setMonths] = useState(3);

  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  const loadSavedRoadmaps = useCallback(async () => {
    try {
      setLoadingRoadmaps(true);
      const res = await api.getRoadmaps();
      setSavedRoadmaps(res || []);
      if (res?.length > 0) {
        setActiveRoadmap((prev) => prev || res[0]);
      }
    } catch (err) {
      console.error("Failed to load saved roadmaps", err);
    } finally {
      setLoadingRoadmaps(false);
    }
  }, []);

  useEffect(() => {
    loadSavedRoadmaps();
  }, [loadSavedRoadmaps]);

  useEffect(() => {
    if (urlRole) {
      setRoleInput(urlRole);
    }
  }, [urlRole]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!roleInput.trim()) {
      showError("Please enter a target role or technical area.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.roadmap({
        role: roleInput.trim(),
        hoursPerDay: Number(hoursPerDay) || 2,
        months: Number(months) || 3,
        currentLevel,
      });

      setActiveRoadmap(res);
      success(`Roadmap for ${res.targetRole || roleInput} generated and saved!`);
      loadSavedRoadmaps();
    } catch (err) {
      showError(err.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    if (!activeRoadmap?._id) return;

    try {
      const res = await api.toggleRoadmapTask(activeRoadmap._id, taskId);
      setActiveRoadmap((prev) => {
        if (!prev) return null;
        const updatedPlan = prev.weeklyPlan.map((t) =>
          (t._id || t.id) === taskId ? { ...t, completed: res.task.completed } : t
        );
        return {
          ...prev,
          weeklyPlan: updatedPlan,
          progressPercentage: res.progressPercentage,
        };
      });
      success(res.message);
    } catch (err) {
      showError(err.message || "Failed to update milestone status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personalized Learning Roadmap</h1>
          <p className="mt-1 text-sm text-slate-500">
            Structured weekly study plans with actionable milestones and progress tracking.
          </p>
        </div>

        {savedRoadmaps.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Saved roadmaps:</span>
            <select
              value={activeRoadmap?._id || ""}
              onChange={(e) => {
                const found = savedRoadmaps.find((r) => r._id === e.target.value);
                if (found) setActiveRoadmap(found);
              }}
              className="rounded-md border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-700 font-semibold focus:border-brand-500 focus:outline-none cursor-pointer"
            >
              {savedRoadmaps.map((rm) => (
                <option key={rm._id} value={rm._id}>
                  {rm.title} ({rm.progressPercentage || 0}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-start">
        {/* Left Form: Generator */}
        <div className="card-white p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Route size={18} className="text-brand-700" />
            <h2 className="text-sm font-bold text-slate-900">Generate New Roadmap</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role or Skill Area</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Developer, AI/ML Engineer"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />

              {/* Quick suggestions */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {commonRoles.slice(0, 5).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleInput(r)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  >
                    + {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Level</label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Study Hours / Day</label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4+ hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Duration</label>
                <select
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value={1}>1 Month (Sprint)</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months (Standard)</option>
                  <option value={6}>6 Months (Mastery)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating Study Milestones...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Learning Roadmap
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Interactive Roadmap Timeline */}
        <div>
          {loading ? (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Architecting learning milestones...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Structuring phases, weekly practice deliverables, and deliverables.
              </p>
            </div>
          ) : activeRoadmap ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-white p-6 space-y-6"
            >
              {/* Roadmap Header & Progress */}
              <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="badge-indigo">{activeRoadmap.targetRole}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeRoadmap.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {activeRoadmap.totalWeeks} Weeks ({activeRoadmap.totalHours} hrs)
                    </span>
                    <span>•</span>
                    <span>{activeRoadmap.hoursPerDay} hrs/day</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{activeRoadmap.progressPercentage || 0}% Complete</p>
                    <p className="text-[10px] text-slate-400">Milestone Progress</p>
                  </div>
                  <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-700 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activeRoadmap.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 3 Phases Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(activeRoadmap.phases || []).map((phase, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                    <span className="text-[10px] font-bold text-brand-700 uppercase">Phase {idx + 1}</span>
                    <h4 className="font-bold text-slate-900 mt-0.5 truncate">{phase.name.split(":")[1] || phase.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{phase.milestone}</p>
                  </div>
                ))}
              </div>

              {/* Weekly Deliverables Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Weekly Action Plan & Milestones
                </h4>

                <div className="space-y-2 max-h-[500px] overflow-y-auto soft-scroll pr-1">
                  {(activeRoadmap.weeklyPlan || []).map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div
                        key={taskId}
                        onClick={() => handleToggleTask(taskId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          task.completed
                            ? "bg-emerald-50/50 border-emerald-200/80"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => {}} // Handled by parent div
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold ${
                                task.completed ? "text-slate-500 line-through" : "text-slate-900"
                              }`}
                            >
                              Week {task.week}: {task.focus}
                            </span>
                            <span className="badge-slate text-[10px] shrink-0">~{task.hours} hrs</span>
                          </div>
                          <p
                            className={`text-[11px] mt-1 leading-relaxed ${
                              task.completed ? "text-slate-400 line-through" : "text-slate-600"
                            }`}
                          >
                            <span className="font-semibold text-slate-700">Deliverable: </span>
                            {task.deliverable}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Study Guidelines</p>
                {(activeRoadmap.recommendations || []).map((rec, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-brand-700 font-bold">•</span>
                    {rec}
                  </p>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Map size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">No Active Roadmap Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Fill in your target role and study availability on the left, then click "Generate Learning Roadmap" to build a customized timeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
