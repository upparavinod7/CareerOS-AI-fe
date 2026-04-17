import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { BriefcaseBusiness, CheckCircle2, ClipboardList, FlameKindling, Sparkles, ChartLine } from "lucide-react";
import { api } from "../services/api";
import type { DashboardData } from "../types";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <motion.article 
      variants={fadeUp} 
      className="saas-card p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        {icon && (
          <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 p-2 text-brand-600 dark:text-brand-400">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
    </motion.article>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30",
    Interview: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/30",
    Offer: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20 dark:bg-brand-400/10 dark:text-brand-400 dark:ring-brand-400/30",
    Rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/30",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${map[status] || "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20"}`}>
      {status}
    </span>
  );
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
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      <div className="mb-8 relative z-10">
        <motion.h1 variants={fadeUp} className="text-3xl font-extrabold tracking-tight text-gradient">Dashboard Overview</motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Track your application pipeline, skill fit, and market demand.</motion.p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard title="Applications" value={String(data?.applicationsCount ?? 0)} subtitle="Total tracked" icon={<BriefcaseBusiness size={20} />} />
        <MetricCard title="Interviews" value={String(interviews)} subtitle="In pipeline" icon={<ClipboardList size={20} />} />
        <MetricCard title="Offers" value={String(offers)} subtitle="Won offers" icon={<CheckCircle2 size={20} />} />
        <MetricCard title="Avg Fit" value={`${data?.fitSummary?.average ?? 0}%`} subtitle="Across analyses" icon={<ChartLine size={20} />} />
        <MetricCard title="Last Fit" value={`${data?.fitSummary?.last ?? 0}%`} subtitle="Most recent" icon={<Sparkles size={20} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.article variants={fadeUp} className="saas-card p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Fit Score Trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your trajectory over recent analyses</p>
            </div>
            <StatusPill status={`Best ${data?.fitSummary?.best ?? 0}%`} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitSeries} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 text-slate-300 dark:text-slate-600" />
                <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" domain={[0, 100]} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #e2e8f0)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Line type="monotone" dataKey="fit" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="saas-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Recent Applications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest pipeline updates</p>
            </div>
          </div>
          <div className="space-y-4">
            {(data?.recentApplications || []).map((app) => (
              <div key={app.id} className="group flex items-center justify-between gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {app.job?.title || "Job Title"}
                  </p>
                  <p className="mt-1 flex text-xs leading-5 text-slate-500 dark:text-slate-400">
                    <span className="truncate">{app.job?.company || "Company"}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill status={app.status} />
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 uppercase tracking-wide">{new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(data?.recentApplications?.length || 0) === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No applications</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Apply to see your pipeline here.</p>
              </div>
            ) : null}
          </div>
        </motion.article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
         <motion.article variants={fadeUp} className="saas-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Application Velocity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Activity over the last 6 weeks</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineSeries} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 text-slate-300 dark:text-slate-600" />
                <XAxis dataKey="label" stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" allowDecimals={false} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }} 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #e2e8f0)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="saas-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Market Demand</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hot roles right now</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandSeries} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 text-slate-300 dark:text-slate-600" />
                <XAxis dataKey="role" stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500 text-xs" tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }} 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #e2e8f0)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Bar dataKey="demand" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.article variants={fadeUp} className="saas-card p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Top Missing Skills</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">From your latest fit analysis</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length ? (
              missingSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/30">
                  {skill.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">Run a fit analysis to surface gaps.</span>
            )}
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="saas-card p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Next Best Actions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tactical steps to boost response rate</p>
          </div>
          <ul className="space-y-3">
            {tasks.length ? (
              tasks.map((task) => (
                <li key={task} className="flex gap-x-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  <FlameKindling className="mt-1 h-4 w-4 flex-none text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  {task}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 dark:text-slate-400">Add skills and run an analysis to generate tasks.</li>
            )}
          </ul>
        </motion.article>
      </div>
    </motion.section>
  );
}
