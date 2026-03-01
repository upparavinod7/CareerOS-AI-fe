import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../services/api";
import type { DashboardData } from "../types";
import { BriefcaseBusiness, ChartLine, CheckCircle2, ClipboardList, FlameKindling, Sparkles } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon?: ReactNode }) {
  return (
    <motion.article
      variants={fadeUp}
      className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        {icon ? <div className="rounded-full bg-white/10 p-2 text-cyan-200">{icon}</div> : null}
      </div>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </motion.article>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied: "bg-blue-500/15 text-blue-200 border-blue-400/30",
    Interview: "bg-amber-500/15 text-amber-200 border-amber-400/30",
    Offer: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    Rejected: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${map[status] || "bg-white/10 text-slate-200 border-white/20"}`}>{status}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.dashboard().then(setData).catch(() => setData(null));
  }, []);

  const fitSeries = useMemo(
    () =>
      (data?.fitHistory || [])
        .slice()
        .reverse()
        .map((item) => ({
          date: new Date(item.createdAt).toLocaleDateString(),
          fit: item.fitScore,
        })),
    [data?.fitHistory],
  );

  const demandSeries = useMemo(
    () => (data?.marketDemand || []).map((item) => ({ role: item.role, demand: item.demandScore })),
    [data?.marketDemand],
  );

  const pipelineSeries = useMemo(
    () => (data?.pipelineVelocity || []).map((row) => ({ label: row.label, count: row.count })),
    [data?.pipelineVelocity],
  );

  const status = data?.statusBreakdown || {};
  const interviews = status["Interview"] || 0;
  const offers = status["Offer"] || 0;
  const rejections = status["Rejected"] || 0;

  const missingSkills = data?.topMissingSkills || [];
  const tasks = missingSkills.slice(0, 3).map((skill) => `Build a 2-day project highlighting ${skill.replace(/_/g, " ")}`);

  return (
    <motion.section
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-5"
    >
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard title="Applications" value={String(data?.applicationsCount ?? 0)} subtitle="Total tracked" icon={<BriefcaseBusiness size={16} />} />
        <MetricCard title="Interviews" value={String(interviews)} subtitle="In pipeline" icon={<ClipboardList size={16} />} />
        <MetricCard title="Offers" value={String(offers)} subtitle="Won offers" icon={<CheckCircle2 size={16} />} />
        <MetricCard title="Avg Fit" value={`${data?.fitSummary?.average ?? 0}%`} subtitle="Across analyses" icon={<ChartLine size={16} />} />
        <MetricCard title="Last Fit" value={`${data?.fitSummary?.last ?? 0}%`} subtitle="Most recent" icon={<Sparkles size={16} />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.article variants={fadeUp} className="glass rounded-2xl p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Fit Score Trend</h2>
              <p className="text-xs text-slate-400">Your trajectory over recent analyses</p>
            </div>
            <StatusPill status={`Best ${data?.fitSummary?.best ?? 0}%`} />
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitSeries}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="fit" stroke="#22d3ee" strokeWidth={2.2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Application Velocity</h2>
            <StatusPill status={`? ${pipelineSeries.at(-1)?.count ?? 0}`} />
          </div>
          <p className="text-xs text-slate-400">Last 6 weeks</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineSeries}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.article variants={fadeUp} className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white">Market Demand</h2>
          <p className="text-xs text-slate-400">Roles with active demand</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandSeries}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="role" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="demand" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="glass rounded-2xl p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
            <StatusPill status={`${rejections} Rejected`} />
          </div>
          <div className="mt-3 space-y-3">
            {(data?.recentApplications || []).map((app) => (
              <div key={app.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{app.job?.title || "Job"} • {app.job?.company || ""}</p>
                    <p className="text-xs text-slate-400">{app.job?.location || ""} • {app.job?.role || ""} • {app.job?.sourcePlatform || ""}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <StatusPill status={app.status} />
                    <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {(data?.recentApplications?.length || 0) === 0 ? (
              <p className="text-sm text-slate-400">No applications yet. Start applying to see your pipeline here.</p>
            ) : null}
          </div>
        </motion.article>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.article variants={fadeUp} className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white">Top Missing Skills</h2>
          <p className="text-xs text-slate-400">From your latest fit analysis</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.length ? (
              missingSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-100">
                  {skill.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">Run a fit analysis to surface gaps.</span>
            )}
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white">Next Best Actions</h2>
          <p className="text-xs text-slate-400">Tactical steps to boost response rate</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {tasks.length ? (
              tasks.map((task) => (
                <li key={task} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-start gap-2">
                  <FlameKindling size={14} className="mt-0.5 text-amber-300" />
                  <span>{task}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Add skills and run an analysis to generate tasks.</li>
            )}
          </ul>
        </motion.article>

        <motion.article variants={fadeUp} className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-white">Pipeline Snapshot</h2>
          <p className="text-xs text-slate-400">Where you stand today</p>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
              <span>Applied</span>
              <span className="font-semibold">{status["Applied"] || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
              <span>Interview</span>
              <span className="font-semibold">{interviews}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
              <span>Offer</span>
              <span className="font-semibold">{offers}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
              <span>Rejected</span>
              <span className="font-semibold">{rejections}</span>
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
