import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, MapPin, RefreshCw, Search, Send } from "lucide-react";
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(safe)}&background=0b1220&color=67e8f9&size=64&bold=true`;
  }
}

function fallbackLogo(company: string) {
  const safe = company.trim() || "Company";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safe)}&background=0b1220&color=67e8f9&size=64&bold=true`;
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
      className="h-11 w-11 rounded-lg border border-white/10 bg-slate-900 object-cover"
    />
  );
}

function JobsSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="glass animate-pulse rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-700/60" />
            <div className="flex-1">
              <div className="h-4 w-2/3 rounded bg-slate-700/60" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-700/50" />
            </div>
          </div>
          <div className="mt-4 h-3 w-11/12 rounded bg-slate-700/40" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-700/40" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="h-9 rounded bg-slate-700/50" />
            <div className="h-9 rounded bg-slate-700/50" />
            <div className="h-9 rounded bg-slate-700/50" />
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
      const response = await api.searchJobs({ ...filters, page: newPage, limit: 8, sort: "recent" });
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
    <section className="grid gap-4 xl:grid-cols-[310px_1fr]">
      <aside className="glass h-fit rounded-2xl p-4">
        <h1 className="text-xl font-semibold text-white">Jobs</h1>
        <p className="mt-1 text-xs text-slate-400">Premium live job discovery</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              placeholder="Keyword"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
          {(["role", "location", "experience", "minSalary", "maxSalary"] as const).map((field) => (
            <input
              key={field}
              placeholder={field}
              value={filters[field]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
            />
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <button onClick={() => load(1)} className="w-full rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Search Jobs
          </button>
          <button
            onClick={async () => {
              await api.syncJobsNow();
              await load(1);
              const status = await api.getJobSyncStatus();
              setSyncStatus(status);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"
          >
            <RefreshCw size={14} />
            Sync Feed
          </button>
        </div>

        <div className="mt-4 space-y-1 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
          <p className="flex items-center justify-between">
            <span>Live Channel</span>
            <span className={liveConnected ? "text-emerald-300" : "text-rose-300"}>
              {liveConnected ? "Connected" : "Offline"}
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span>Last Sync</span>
            <span>{syncLabel}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Active Jobs</span>
            <span>{syncStatus?.totalActiveJobs ?? syncStatus?.lastResult?.totalActive ?? "-"}</span>
          </p>
          {liveEvent?.type === "jobs_sync" ? (
            <p className="pt-1 text-emerald-300">
              +{liveEvent.payload.inserted || 0} new, {liveEvent.payload.updated || 0} updated
            </p>
          ) : null}
        </div>
      </aside>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300">{loading ? "Loading jobs..." : `${jobs.length} jobs on this page`}</p>
          <p className="text-sm text-slate-400">Page {page} / {totalPages}</p>
        </div>

        {loading ? <JobsSkeleton /> : null}

        {!loading && jobs.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-slate-300">No jobs found for current filters.</div>
        ) : null}

        {!loading ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {jobs.map((job) => {
              const saved = savedJobs.has(job._id);

              return (
                <motion.article
                  key={job._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, scale: 1.002 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                      <CompanyLogo job={job} />
                      <div>
                        <h2 className="text-base font-semibold text-white">{job.title}</h2>
                        <p className="text-sm text-slate-300">{job.company}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={12} />
                          {job.location}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                      {job.sourceLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="font-medium text-cyan-300">{job.currency} {job.minSalary} - {job.maxSalary}</p>
                    <p className="text-xs text-slate-400">{job.experienceLevel}</p>
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-300">{toPlainTextDescription(job.description)}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded-full bg-white/6 px-2 py-1 text-[11px] text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
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
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60"
                    >
                      {applyingId === job._id ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                      {applyingId === job._id ? "Applying..." : "Apply"}
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
                      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs ${
                        saved ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-white/5 text-slate-200"
                      }`}
                    >
                      <Bookmark size={13} />
                      {saved ? "Saved" : "Save"}
                    </button>
                    <a
                      href={job.sourceUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs ${
                        job.sourceUrl ? "border-white/15 bg-white/5 text-slate-200" : "pointer-events-none border-white/10 bg-white/5 text-slate-500"
                      }`}
                    >
                      <ExternalLink size={13} />
                      Open
                    </a>
                  </div>
                  {applyMessage[job._id] ? (
                    <p
                      className={`mt-2 text-xs ${
                        applyMessage[job._id] === "Applied" ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {applyMessage[job._id] === "Applied" ? "Application saved to your tracker." : applyMessage[job._id]}
                    </p>
                  ) : null}
                </motion.article>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => load(page - 1)} className="rounded border border-white/20 px-3 py-1 disabled:opacity-50">
            Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="rounded border border-white/20 px-3 py-1 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
