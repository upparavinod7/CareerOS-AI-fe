import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Calendar, Map, Route, Sparkles, Timer, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import type { Roadmap } from "../types";

const topics = [
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "System Design",
  "Cloud Architecture",
];

export default function RoadmapPage() {
  const [roleInput, setRoleInput] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [months, setMonths] = useState(3);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roleInput.trim()) {
      setError("Please enter a target role or goal.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.roadmap({
        role: roleInput,
        hoursPerDay,
        months,
      });
      setRoadmap(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap.");
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
              <Route size={20} />
            </span>
            Learning Roadmaps
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create a structured, weekly study plan targeting a specific role or skill gap.
          </p>
        </div>

        <form onSubmit={onSubmit} className="saas-card p-6 border-t-4 border-t-brand-500">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Role or Goal</label>
              <div className="mt-2 text-slate-500 dark:text-slate-400">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="e.g. Master Backend Development"
                />
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2 text-slate-500">
                {topics.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      if (!roleInput.includes(item)) {
                        setRoleInput(item);
                      }
                    }}
                    className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700/50"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Study Hours / Day</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min={1}
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Math.max(1, Number(e.target.value)))}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Duration (Months)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min={1}
                    value={months}
                    onChange={(e) => setMonths(Math.max(1, Number(e.target.value)))}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
                  />
                </div>
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
              className="flex w-full justify-center rounded-md bg-brand-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Timer size={20} className="animate-spin" /> Generating Plan...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={20} /> Generate Roadmap</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-8 lg:mt-0 lg:w-1/2 xl:w-7/12">
        <div className="saas-card h-full min-h-[600px] bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
                  Curriculum Guide
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Milestones, pacing, and weekly focal points.</p>
              </div>
              {roadmap?.resolvedRole && (
                 <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/30">
                  {roadmap.resolvedRole} ({Math.round((roadmap.roleMatchConfidence || 0) * 100)}% Match)
                </span>
              )}
            </div>
          </div>

          {!roadmap ? (
            <div className="flex h-[500px] flex-col items-center justify-center text-center p-12">
              <Route size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No Roadmap Generated</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set your goals and parameters on the left to generate your custom learning path.</p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard icon={<Timer size={16} />} label="Total Hours" value={`${roadmap.totalHours} hrs`} brand="brand-primary" />
                <SummaryCard icon={<Calendar size={16} />} label="Total Weeks" value={`${roadmap.totalWeeks} wks`} brand="brand-secondary" />
                <SummaryCard icon={<TrendingUp size={16} />} label="Daily Pace" value={`${roadmap.hoursPerDay} hrs/d`} brand="brand-accent" />
              </div>
              
              {/* Phases */}
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-4">Major Phases</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {roadmap.phases.map((phase) => (
                    <div
                      key={phase.name}
                      className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                    >
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{phase.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {phase.durationWeeks} weeks • {phase.focus}
                      </p>
                      <div className="mt-3 rounded-md bg-slate-50 p-2 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key Milestone</p>
                        <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{phase.milestone}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {phase.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {skill.replace(/_/g, " ")}
                          </span>
                        ))}
                        {phase.skills.length > 3 && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-400">+{phase.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                 <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Map size={16} className="text-brand-500" />
                  Skill Allocation Timeline
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {roadmap.timeline.map((item) => (
                    <div key={`${item.skill}-${item.startWeek}`} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">{item.skill.replace(/_/g, " ")}</span>
                          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                            {item.level} • {item.allocatedHours} hrs
                          </span>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600">
                          W{item.startWeek}-W{item.endWeek}
                        </span>
                      </div>
                      
                      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(100, (item.allocatedHours / roadmap.totalHours) * 240)}%` }}
                        />
                      </div>
                      
                      <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {item.resources.slice(0, 3).map((res) => (
                          <li key={res} className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 rounded-full bg-brand-400 shrink-0" />
                            <span className="line-clamp-2 leading-snug">{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Focus */}
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-brand-500" />
                  Weekly Objectives
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roadmap.weeklyPlan.map((week) => (
                    <div key={week.week} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-semibold text-slate-900 dark:text-white">Week {week.week}</span>
                         <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{week.hours} hrs</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{week.focus}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Deliverable:</span> {week.deliverable}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ icon, label, value, brand }: { icon: ReactNode; label: string; value: string; brand: "brand-primary" | "brand-secondary" | "brand-accent" }) {
  // Mapping standard brands to indigo/slate palette equivalent
  const iconColor = {
    "brand-primary": "text-brand-600 dark:text-brand-400",
    "brand-secondary": "text-indigo-600 dark:text-indigo-400",
    "brand-accent": "text-sky-600 dark:text-sky-400"
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${iconColor[brand]}`}>
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
