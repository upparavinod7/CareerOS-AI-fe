import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BriefcaseBusiness, ExternalLink, MapPin, RefreshCw, Search, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import type { Job, JobSyncStatus } from "../types";

type LiveEvent = {
  type: string;
  timestamp: string;
  payload: {
    inserted?: number;
    updated?: number;
  };
};

function getCompanyLogo(url: string, company: string) {
  try {
    const host = new URL(url).hostname;
    return `https://logo.clearbit.com/${host}`;
  } catch {
    const safe = company.trim() || "Company";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(safe)}&background=f1f5f9&color=475569&size=64&bold=true`;
  }
}

function fallbackLogo(company: string) {
  const safe = company.trim() || "Company";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safe)}&background=f1f5f9&color=475569&size=64&bold=true`;
}

function toPlainTextDescription(value: string) {
  if (!value) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  const text = doc.body.textContent || "";
  return text.replace(/\s+/g, " ").trim();
}

function CompanyLogo({ job }: { job: Job }) {
  const primary = getCompanyLogo(job.sourceUrl, job.company);
  const secondary = fallbackLogo(job.company);
  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(primary);
  }, [primary]);

  return (
    <img
      src={src}
      alt={job.company}
      onError={() => {
        if (src !== secondary) {
          setSrc(secondary);
        }
      }}
      className="h-12 w-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white object-contain p-1"
    />
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-4 lg:col-span-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="saas-card animate-pulse p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-4/5 rounded-md bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-9 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
            <div className="h-9 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState({
    q: initialQuery,
    role: "",
    location: "",
    experience: "",
    minSalary: "",
    maxSalary: "",
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syncStatus, setSyncStatus] = useState<JobSyncStatus | null>(null);
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (newPage = page) => {
    setLoading(true);
    try {
      const response = await api.searchJobs({ ...filters, page: newPage, limit: 10, sort: "recent" });
      setJobs(response.items);
      setPage(response.page);
      setTotalPages(response.totalPages || 1);
      if (response.realtime?.sync) {
        setSyncStatus(response.realtime.sync);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1).catch(() => undefined);
    api.getJobSyncStatus().then(setSyncStatus).catch(() => undefined);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q) {
      setFilters((prev) => ({ ...prev, q }));
    }
  }, [searchParams]);

  useEffect(() => {
    const stream = new EventSource(api.streamJobsUrl());
    stream.onopen = () => setLiveConnected(true);
    stream.onerror = () => setLiveConnected(false);

    stream.addEventListener("jobs_sync", (event) => {
      const payload = JSON.parse(event.data) as LiveEvent;
      setLiveEvent(payload);
      api.getJobSyncStatus().then(setSyncStatus).catch(() => undefined);
      load(1).catch(() => undefined);
    });

    return () => stream.close();
  }, []);

  const syncLabel = useMemo(() => {
    if (!syncStatus?.lastSyncAt) return "Never";
    return new Date(syncStatus.lastSyncAt).toLocaleString();
  }, [syncStatus?.lastSyncAt]);

  return (
    <section className="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]">
      {/* Sidebar Filters */}
      <aside className="saas-card h-fit p-5">
        <div className="mb-6 relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-gradient">Job Feed</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Discover matching roles</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Keywords</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Job title, company..."
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                className="block w-full rounded-md border-0 py-2 pl-9 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
              />
            </div>
          </div>
          
          {(["role", "location", "experience", "minSalary", "maxSalary"] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type="text"
                placeholder={field === 'minSalary' || field === 'maxSalary' ? 'e.g. 100000' : ''}
                value={filters[field]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
                className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
              />
            </div>
          ))}

          <button 
            onClick={() => load(1)} 
            className="w-full mt-2 rounded-xl bg-gradient-brand px-3 py-3 text-sm font-bold"
          >
            Apply Filters
          </button>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Data Pipeline</h3>
             <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${liveConnected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${liveConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {liveConnected ? "Live" : "Offline"}
             </span>
          </div>

          <button
            onClick={async () => {
              await api.syncJobsNow();
              await load(1);
              const status = await api.getJobSyncStatus();
              setSyncStatus(status);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700/50"
          >
            <RefreshCw size={14} className="text-slate-400 group-hover:animate-spin-slow" />
            Force Sync
          </button>

          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Last Synced</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-200">{syncLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Total Active</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-200">{syncStatus?.totalActiveJobs ?? syncStatus?.lastResult?.totalActive ?? "-"}</dd>
            </div>
            {liveEvent?.type === "jobs_sync" && (
               <div className="mt-2 text-emerald-600 dark:text-emerald-400">
                +{liveEvent.payload.inserted || 0} inserted, {liveEvent.payload.updated || 0} updated
              </div>
            )}
          </dl>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {loading ? "Searching..." : `${jobs.length} jobs on this page`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
          </div>
        </div>

        {loading ? <JobsSkeleton /> : null}

        {!loading && jobs.length === 0 ? (
          <div className="saas-card flex h-64 flex-col items-center justify-center text-center">
            <BriefcaseBusiness size={32} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No jobs found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : null}

        {!loading && jobs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {jobs.map((job) => {
              const saved = savedJobs.has(job._id);

              return (
                <motion.article
                  key={job._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="saas-card group p-5 sm:p-6 transition-all hover:scale-[1.01] hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <CompanyLogo job={job} />
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {job.title}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-slate-400" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex shrink-0 items-center justify-end gap-2">
                       <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        {job.sourceLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {(job.minSalary || job.maxSalary) && (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {job.currency} {job.minSalary} {job.maxSalary ? `- ${job.maxSalary}` : ""}
                      </span>
                    )}
                    {job.experienceLevel && (
                       <span className="border-l border-slate-300 dark:border-slate-700 pl-4">{job.experienceLevel}</span>
                    )}
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {toPlainTextDescription(job.description)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      onClick={async () => {
                        setApplyMessage((m) => ({ ...m, [job._id]: "" }));
                        setApplyingId(job._id);
                        try {
                          await api.createApplication({ jobId: job._id, notes: "" });
                          setApplyMessage((m) => ({ ...m, [job._id]: "Applied" }));
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : "Apply failed";
                          setApplyMessage((m) => ({ ...m, [job._id]: msg }));
                        } finally {
                          setApplyingId(null);
                        }
                      }}
                      disabled={applyingId === job._id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-bold disabled:opacity-50"
                    >
                      {applyingId === job._id ? <RefreshCw size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
                      Track Application
                    </button>
                    
                    <button
                      onClick={() =>
                        setSavedJobs((prev) => {
                          const next = new Set(prev);
                          if (next.has(job._id)) next.delete(job._id);
                          else next.add(job._id);
                          return next;
                        })
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50 ${
                        saved 
                          ? "text-emerald-600 ring-emerald-600/20 dark:text-emerald-400 dark:ring-emerald-500/20" 
                          : "text-slate-900 ring-slate-300 dark:text-white dark:ring-slate-700"
                      }`}
                    >
                      <Bookmark size={16} className={saved ? "fill-emerald-600 dark:fill-emerald-400" : ""} />
                      {saved ? "Saved" : "Save"}
                    </button>
                    
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700/50"
                      >
                        <ExternalLink size={16} />
                        View Orig
                      </a>
                    )}
                    
                    {applyMessage[job._id] && (
                       <span className={`ml-auto text-sm font-medium ${applyMessage[job._id] === "Applied" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {applyMessage[job._id] === "Applied" ? "Added to pipeline ✓" : applyMessage[job._id]}
                      </span>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 py-3">
           <button 
             disabled={page <= 1} 
             onClick={() => load(page - 1)} 
             className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700/50"
           >
            Previous
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => load(page + 1)} 
             className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700/50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
