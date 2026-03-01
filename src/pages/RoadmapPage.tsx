import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import type { Roadmap } from "../types";
import { Map, Calendar, Timer, Sparkles, TrendingUp, ListChecks } from "lucide-react";

const quickRoles = ["ML Engineer", "Data Scientist", "Backend Developer", "DevOps Engineer", "Frontend Developer"];

export default function RoadmapPage() {
  const [role, setRole] = useState("ML Engineer");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [months, setMonths] = useState(4);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const output = await api.roadmap({ role, hoursPerDay, months });
      setRoadmap(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roadmap generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 text-white">
          <Map size={18} className="text-cyan-300" />
          <h1 className="text-xl font-semibold">Roadmap Generator</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">Phased, realistic study plan with milestones, resources, and weekly focus.</p>

        <label className="mt-4 block text-sm text-slate-300">Target Role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
          placeholder="ML Engineer"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickRoles.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-300">Hours / day</label>
            <input
              type="number"
              min={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Duration (months)</label>
            <input
              type="number"
              min={1}
              value={months}
              onChange={(e) => setMonths(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {loading ? <Timer size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </form>

      <article className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Roadmap</h2>
            <p className="text-sm text-slate-400">Milestones, weekly focus, resources, and phase-based pacing.</p>
          </div>
          {roadmap?.resolvedRole ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              {roadmap.resolvedRole} ({Math.round((roadmap.roleMatchConfidence || 0) * 100)}% match)
            </span>
          ) : null}
        </div>

        {!roadmap ? (
          <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            Generate a roadmap to see phases, weekly plan, and resources tailored to your role.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard icon={<Timer size={16} />} label="Total Hours" value={`${roadmap.totalHours} hrs`} />
              <SummaryCard icon={<Calendar size={16} />} label="Total Weeks" value={`${roadmap.totalWeeks} weeks`} />
              <SummaryCard icon={<TrendingUp size={16} />} label="Daily Pace" value={`${roadmap.hoursPerDay} hrs/day`} />
            </div>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ListChecks size={16} className="text-cyan-300" />
                Phases & milestones
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {roadmap.phases.map((phase) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-3"
                  >
                    <p className="text-sm font-semibold text-white">{phase.name}</p>
                    <p className="text-xs text-slate-400">{phase.durationWeeks} weeks • {phase.focus}</p>
                    <p className="mt-2 text-xs text-emerald-300">Milestone: {phase.milestone}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {phase.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-200">{skill}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Map size={16} className="text-cyan-300" />
                Skill timeline
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {roadmap.timeline.map((item) => (
                  <div key={`${item.skill}-${item.startWeek}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span className="font-medium">{item.skill.replace(/_/g, " ")}</span>
                      <span className="text-xs text-slate-300">{item.level}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Weeks {item.startWeek}-{item.endWeek} • {item.allocatedHours} hrs</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400"
                        style={{ width: `${Math.min(100, (item.allocatedHours / roadmap.totalHours) * 240)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-emerald-200">Milestone: {item.milestone}</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">
                      {item.resources.map((res) => (
                        <li key={res}>• {res}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar size={16} className="text-cyan-300" />
                Weekly focus
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {roadmap.weeklyPlan.map((week) => (
                  <div key={week.week} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Week {week.week}</span>
                      <span>{week.hours} hrs</span>
                    </div>
                    <p className="mt-1 font-medium">{week.focus}</p>
                    <p className="text-xs text-emerald-200">Deliverable: {week.deliverable}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Recommendations</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {roadmap.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </article>
    </section>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-300">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
