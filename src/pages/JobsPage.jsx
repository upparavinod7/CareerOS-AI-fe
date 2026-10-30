import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Send,
  X,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";

function CompanyAvatar({ name }) {
  const safe = (name || "Company").trim();
  const initials = safe.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm">
      {initials}
    </div>
  );
}

function toPlainText(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [locationFilter, setLocationFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedJob, setSelectedJob] = useState(null);

  // Tracking Action State
  const [applyingId, setApplyingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Sync user savedJobs into state
  useEffect(() => {
    if (user?.savedJobs) {
      const ids = user.savedJobs.map((j) => (typeof j === "string" ? j : j._id || j.id));
      setSavedJobIds(new Set(ids));
    }
  }, [user?.savedJobs]);

  const loadJobs = async (pageNumber = 1) => {
    try {
      setLoading(true);

      if (viewSavedOnly) {
        const savedRes = await api.getSavedJobs();
        setJobs(savedRes || []);
        setTotal((savedRes || []).length);
        setPage(1);
        setTotalPages(1);
      } else {
        const params = {
          page: pageNumber,
          limit: 10,
          sort: sortBy,
        };
        if (query.trim()) params.q = query.trim();
        if (locationFilter.trim()) params.location = locationFilter.trim();
        if (workTypeFilter !== "All") params.workType = workTypeFilter;
        if (roleFilter !== "All") params.role = roleFilter;

        const res = await api.searchJobs(params);
        setJobs(res.items || []);
        setTotal(res.total || 0);
        setPage(res.page || 1);
        setTotalPages(res.totalPages || 1);
        if (res.realtime?.sync) {
          setSyncStatus(res.realtime.sync);
        }
      }
    } catch (err) {
      showError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(1);
  }, [workTypeFilter, roleFilter, sortBy, viewSavedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs(1);
  };

  const handleToggleSave = async (job) => {
    const isSaved = savedJobIds.has(job._id);
    const nextSet = new Set(savedJobIds);

    try {
      if (isSaved) {
        nextSet.delete(job._id);
        setSavedJobIds(nextSet);
        await api.unsaveJob(job._id);
        success(`Removed ${job.title} from saved jobs`);
      } else {
        nextSet.add(job._id);
        setSavedJobIds(nextSet);
        await api.saveJob(job._id);
        success(`Saved ${job.title} to your bookmarks`);
      }
      refreshProfile().catch(() => {});
    } catch (err) {
      showError(err.message || "Could not update saved job");
    }
  };

  const handleTrackApplication = async (job) => {
    setApplyingId(job._id);
    try {
      await api.createApplication({
        jobId: job._id,
        notes: `Imported directly from Job Board on ${new Date().toLocaleDateString()}`,
        status: "Applied",
      });
      success(`Added ${job.title} at ${job.company} to your Application Tracker!`);
    } catch (err) {
      showError(err.message || "Application is already tracked");
    } finally {
      setApplyingId(null);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await api.syncJobsNow();
      await loadJobs(1);
      const status = await api.getJobSyncStatus();
      setSyncStatus(status);
      success("Job feed synchronized successfully with live sources.");
    } catch (err) {
      showError("Sync failed. Check connection.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtext */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Find Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore verified career opportunities, saved bookmarks, and real-time synchronized feeds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Fetch latest listings from feed providers"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin text-brand-700" : ""} />
            {syncing ? "Syncing..." : "Sync Feeds"}
          </button>
          <button
            onClick={() => setViewSavedOnly(!viewSavedOnly)}
            className={`btn-secondary text-xs py-1.5 px-3 ${
              viewSavedOnly ? "bg-indigo-50 border-brand-300 text-brand-800 font-semibold" : ""
            }`}
          >
            <Bookmark size={13} className={viewSavedOnly ? "fill-brand-700 text-brand-700" : ""} />
            {viewSavedOnly ? "Showing Saved" : "Saved Jobs"}
          </button>
        </div>
      </div>

      {/* Main Search Bar & Filter Drawer */}
      <div className="card-white p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company name, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Location or Remote..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button type="submit" className="btn-primary text-sm py-2 px-5">
            Search
          </button>
        </form>

        {/* Filter Chips & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Work Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Work Type:</span>
            {["All", "Remote", "Hybrid", "On-site"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWorkTypeFilter(type)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  workTypeFilter === type
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none font-medium cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="demand">Market Demand</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {loading ? "Searching roles..." : `Found ${total} job${total === 1 ? "" : "s"}${viewSavedOnly ? " in your bookmarks" : ""}`}
        </span>
        {!viewSavedOnly && totalPages > 1 && (
          <span>Page {page} of {totalPages}</span>
        )}
      </div>

      {/* Job Cards Feed */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card-white p-5 animate-pulse flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-3 w-1/4 bg-slate-200 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-white p-12 text-center">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No matching jobs discovered</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, location filters, or click "Sync Feeds" to fetch updated opportunities.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setLocationFilter("");
              setWorkTypeFilter("All");
              setViewSavedOnly(false);
              loadJobs(1);
            }}
            className="btn-secondary text-xs mt-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job._id);

            return (
              <motion.article
                key={job._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-white-hover p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <CompanyAvatar name={job.company} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 hover:text-brand-700 transition-colors">
                          {job.title}
                        </h2>
                        {job.workType && <span className="badge-indigo">{job.workType}</span>}
                        {job.experienceLevel && <span className="badge-amber">{job.experienceLevel}</span>}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{job.company}</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {job.location}
                        </span>
                        {job.postedAt && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            {new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Salary and Save Bookmark */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    {job.minSalary && job.maxSalary ? (
                      <span className="text-xs font-bold text-emerald-700">
                        {job.currency} {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Competitive</span>
                    )}

                    <button
                      onClick={() => handleToggleSave(job)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSaved
                          ? "border-brand-200 bg-brand-50 text-brand-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-white"
                      }`}
                      title={isSaved ? "Saved" : "Save job"}
                    >
                      <Bookmark size={15} className={isSaved ? "fill-brand-700" : ""} />
                    </button>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {toPlainText(job.description)}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(job.skills || []).slice(0, 5).map((skill) => (
                    <span key={skill} className="badge-slate text-[11px] py-0.5 px-2">
                      {skill.replace(/_/g, " ")}
                    </span>
                  ))}
                  {job.demandScore > 85 && (
                    <span className="badge-emerald text-[11px] py-0.5 px-2">
                      High Demand
                    </span>
                  )}
                </div>

                {/* Action Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="btn-secondary text-xs py-1.5 px-3.5"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/fit?jobId=${job._id}`)}
                      className="btn-secondary text-xs py-1.5 px-3 text-brand-700 hover:text-brand-800"
                      title="Analyze your compatibility with this position"
                    >
                      <Sparkles size={13} className="text-brand-600" />
                      Analyze Fit
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrackApplication(job)}
                      disabled={applyingId === job._id}
                      className="btn-primary text-xs py-1.5 px-4"
                    >
                      {applyingId === job._id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          Track Application
                        </>
                      )}
                    </button>
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1.5 px-2.5 text-slate-500 hover:text-slate-800"
                        title="Open external job listing"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}

          {/* Pagination Controls */}
          {!viewSavedOnly && totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => loadJobs(page - 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => loadJobs(page + 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal Drawer */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="card-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start gap-3.5">
                  <CompanyAvatar name={selectedJob.company} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedJob.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedJob.company} • {selectedJob.location} • {selectedJob.workType || "Remote"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto soft-scroll space-y-5 text-xs text-slate-700 leading-relaxed">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Salary Range</p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {selectedJob.minSalary ? `${selectedJob.currency} ${selectedJob.minSalary.toLocaleString()} - ${selectedJob.maxSalary?.toLocaleString()}` : "Competitive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Experience</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedJob.experienceLevel || "Mid"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Role Type</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedJob.role || "Engineering"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Source</p>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{selectedJob.sourceLabel || "CareerOS"}</p>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.skills || []).map((skill) => (
                      <span key={skill} className="badge-indigo text-xs py-1 px-2.5">
                        {skill.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Job Description</h4>
                  <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
                    {toPlainText(selectedJob.description)}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const id = selectedJob._id;
                      setSelectedJob(null);
                      navigate(`/fit?jobId=${id}`);
                    }}
                    className="btn-secondary text-xs py-2 px-3.5 text-brand-700"
                  >
                    <Sparkles size={14} className="text-brand-600" />
                    Analyze Fit
                  </button>
                  <button
                    onClick={() => {
                      const role = selectedJob.title;
                      const company = selectedJob.company;
                      setSelectedJob(null);
                      navigate(`/cover-letter?role=${encodeURIComponent(role)}&company=${encodeURIComponent(company)}`);
                    }}
                    className="btn-secondary text-xs py-2 px-3.5"
                  >
                    Draft Cover Letter
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleTrackApplication(selectedJob);
                      setSelectedJob(null);
                    }}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <Send size={14} />
                    Track in Pipeline
                  </button>
                  {selectedJob.sourceUrl && (
                    <a
                      href={selectedJob.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <ExternalLink size={14} />
                      Original Link
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
