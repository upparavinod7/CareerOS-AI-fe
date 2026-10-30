import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  LayoutDashboard,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function MetricCard({ title, value, subtitle, icon, iconColor = "indigo" }) {
  const iconColors = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="card-white p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${iconColors[iconColor] || iconColors.indigo}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400 font-medium">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Interested: "badge-slate",
    Applied: "badge-indigo",
    Assessment: "badge-amber",
    Interview: "badge-indigo font-bold",
    Offer: "badge-emerald font-bold",
    Rejected: "badge-rose",
    Withdrawn: "badge-slate",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard();
      setData(res);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pipelineVelocity = useMemo(() => {
    return (data?.pipelineVelocity || []).map((row) => ({
      week: row.label,
      applications: row.count,
    }));
  }, [data?.pipelineVelocity]);

  const fitTrendSeries = useMemo(() => {
    return (data?.fitHistory || [])
      .slice()
      .reverse()
      .map((item, idx) => ({
        index: idx + 1,
        date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: item.fitScore,
        role: item.role,
      }));
  }, [data?.fitHistory]);

  const interviewsCount = data?.statusBreakdown?.Interview || 0;
  const offersCount = data?.statusBreakdown?.Offer || 0;
  const profileCompletion = user?.profileCompletion ?? data?.user?.profileCompletion ?? 0;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
          <p className="text-xs font-medium">Loading command center analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hi {user?.name?.split(" ")[0] || "there"}, welcome back! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            We're glad to see you again. Here is your career trajectory overview.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboard}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Refresh analytics"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <Link to="/jobs" className="btn-primary text-xs py-1.5 px-3.5">
            <Search size={13} />
            Explore Jobs
          </Link>
        </div>
      </div>

      {/* Profile Completion Bar (if under 100%) */}
      {profileCompletion < 100 && (
        <div className="card-white p-4 border-l-4 border-l-brand-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-indigo-50/20 to-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Profile Readiness</span>
              <span className="text-xs font-bold text-slate-700">{profileCompletion}% complete</span>
            </div>
            <p className="text-xs text-slate-500">
              Add your target role, top skills, and resume text to unlock higher AI fit accuracy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <Link
              to="/profile"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              Complete Profile <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Top Metric KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Applications Tracked"
          value={data?.applicationsCount ?? 0}
          subtitle={`${data?.statusBreakdown?.Applied ?? 0} active in pipeline`}
          icon={<Briefcase size={20} />}
          iconColor="indigo"
        />
        <MetricCard
          title="Jobs Discovered"
          value={data?.totalJobsCount ?? 0}
          subtitle={`${data?.savedJobsCount ?? 0} saved roles`}
          icon={<Search size={20} />}
          iconColor="blue"
        />
        <MetricCard
          title="Interviews & Rounds"
          value={interviewsCount}
          subtitle={`${offersCount} job offer${offersCount === 1 ? "" : "s"} won`}
          icon={<Calendar size={20} />}
          iconColor="emerald"
        />
        <MetricCard
          title="Avg Job-Fit Score"
          value={`${data?.fitSummary?.average ?? 0}%`}
          subtitle={`Best score: ${data?.fitSummary?.best ?? 0}%`}
          icon={<Sparkles size={20} />}
          iconColor="amber"
        />
      </div>

      {/* Primary Analytics Section: Application Velocity & Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Pipeline Activity Chart */}
        <div className="card-white p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Application Velocity</h2>
              <p className="text-xs text-slate-500">Weekly application submissions across the last 6 weeks</p>
            </div>
            <span className="badge-indigo">Live Data</span>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="applications" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Steady application submissions improve interview conversion rates.</span>
            <Link to="/applications" className="font-semibold text-brand-700 hover:underline flex items-center gap-1">
              View Pipeline <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Recent Activities Feed */}
        <div className="card-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Recent Activities</h2>
              <span className="text-xs font-medium text-slate-400">Timeline</span>
            </div>

            <div className="space-y-4">
              {(data?.recentActivities || []).slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      act.badgeColor === "emerald"
                        ? "bg-emerald-100 text-emerald-800"
                        : act.badgeColor === "indigo"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {act.type === "application" ? <Briefcase size={12} /> : <Sparkles size={12} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {act.date ? new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))}

              {(!data?.recentActivities || data.recentActivities.length === 0) && (
                <div className="py-8 text-center">
                  <Clock size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">No activity logged yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Apply to roles or run fit analyses to populate your timeline.</p>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/jobs"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-700 hover:underline flex items-center justify-center gap-1"
          >
            Discover Opportunities <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Secondary Section: Pipeline Status & Fit Score Trajectory */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Pipeline Breakdown */}
        <div className="card-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Application Status Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown of tracked roles by current hiring stage</p>
            </div>
            <Link to="/applications" className="text-xs font-semibold text-brand-700 hover:underline">
              Manage Tracker
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: "Interested", count: data?.statusBreakdown?.Interested || 0, color: "text-slate-700 bg-slate-50" },
              { label: "Applied", count: data?.statusBreakdown?.Applied || 0, color: "text-indigo-700 bg-indigo-50" },
              { label: "Interview", count: data?.statusBreakdown?.Interview || 0, color: "text-purple-700 bg-purple-50" },
              { label: "Offers", count: data?.statusBreakdown?.Offer || 0, color: "text-emerald-700 bg-emerald-50 font-bold" },
            ].map((stat) => (
              <div key={stat.label} className={`p-3 rounded-lg border border-slate-200/60 ${stat.color}`}>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Recent Applications Mini Table */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Applications</p>
            {(data?.recentApplications || []).slice(0, 3).map((app) => (
              <div
                key={app.id || app._id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{app.jobTitle || app.job?.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{app.company || app.job?.company} • {app.location}</p>
                </div>
                <div className="ml-3 shrink-0">
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}

            {(!data?.recentApplications || data.recentApplications.length === 0) && (
              <p className="text-xs text-slate-400 italic py-2">No active applications currently tracked.</p>
            )}
          </div>
        </div>

        {/* Skill Gaps & Strategic Career Actions */}
        <div className="card-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Top Missing Skills & Next Actions</h2>
                <p className="text-xs text-slate-500">High-leverage gaps identified from recent job requirements</p>
              </div>
              <Sparkles size={16} className="text-amber-500" />
            </div>

            {/* Missing Skills Chips */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority Skills to Add</p>
              <div className="flex flex-wrap gap-2">
                {(data?.topMissingSkills || []).length > 0 ? (
                  data.topMissingSkills.map((skill) => (
                    <span key={skill} className="badge-amber text-xs py-1 px-2.5">
                      + {skill.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Run an AI Fit Analysis on a target job to uncover specific skill gaps.</p>
                )}
              </div>
            </div>

            {/* Tactical Action Suggestions */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tactical Recommendations</p>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <Flame size={14} className="text-brand-600 shrink-0 mt-0.5" />
                <span>Generate a targeted learning roadmap for your top target role to structure weekly milestones.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <FileText size={14} className="text-brand-600 shrink-0 mt-0.5" />
                <span>Optimize your master resume with measurable metrics to pass ATS keyword filters.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <Link to="/roadmap" className="btn-secondary text-xs flex-1 text-center justify-center">
              Generate Roadmap
            </Link>
            <Link to="/fit" className="btn-primary text-xs flex-1 text-center justify-center">
              Analyze Job Fit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
