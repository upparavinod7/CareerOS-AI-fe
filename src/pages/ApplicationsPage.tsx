import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Loader2, MapPin, NotebookPen, PlusCircle } from "lucide-react";
import { api } from "../services/api";
import type { Application, Job } from "../types";

const statuses = ["Applied", "Interview", "Rejected", "Offer"] as const;
type Status = (typeof statuses)[number];

function statusClasses(status: Status) {
  if (status === "Offer") return "bg-emerald-400/15 text-emerald-200 border-emerald-300/30";
  if (status === "Interview") return "bg-cyan-400/15 text-cyan-200 border-cyan-300/30";
  if (status === "Rejected") return "bg-rose-400/15 text-rose-200 border-rose-300/30";
  return "bg-amber-400/15 text-amber-200 border-amber-300/30";
}

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [applications, jobsRes] = await Promise.all([
        api.listApplications(),
        api.searchJobs({ page: 1, limit: 30, sort: "recent" }),
      ]);
      setItems(applications);
      setJobs(jobsRes.items);
      setSelectedJobId((prev) => prev || jobsRes.items[0]?._id || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => setError("Failed to load applications."));
  }, []);

  const add = async () => {
    if (!selectedJobId) {
      setError("Select a job first.");
      return;
    }

    setError("");
    setAdding(true);
    try {
      await api.createApplication({ jobId: selectedJobId, notes });
      setNotes("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add application.");
    } finally {
      setAdding(false);
    }
  };

  const summary = useMemo(() => {
    const count: Record<Status, number> = {
      Applied: 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0,
    };
    items.forEach((item) => {
      count[item.status as Status] += 1;
    });
    return count;
  }, [items]);

  return (
    <section className="space-y-4">
      <article className="glass rounded-2xl p-4">
        <h1 className="text-xl font-semibold text-white">Application Tracker</h1>
        <p className="mt-1 text-sm text-slate-400">Track your pipeline from apply to offer with clean status management.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-400">Target Job</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
            >
              {jobs.length === 0 ? <option>No jobs loaded</option> : null}
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-slate-400">Notes</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral, prep notes, follow-up dates..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={add}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
          >
            {adding ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
            {adding ? "Adding..." : "Add to Tracker"}
          </button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-4">
        {statuses.map((status) => (
          <article key={status} className="glass rounded-xl p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">{status}</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary[status]}</p>
          </article>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 text-slate-300">Loading applications...</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-slate-300">No applications yet. Add one from above.</div>
          ) : (
            items.map((item) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                      <BriefcaseBusiness size={16} className="text-cyan-300" />
                      {item.job.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">{item.job.company}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {item.job.location}
                    </p>
                  </div>

                  <select
                    value={item.status}
                    onChange={async (e) => {
                      await api.updateApplication(item._id, { status: e.target.value, notes: item.notes });
                      await load();
                    }}
                    className={`rounded-lg border px-2 py-1 text-xs ${statusClasses(item.status as Status)}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-slate-300">
                  <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <NotebookPen size={12} />
                    Notes
                  </p>
                  <p className="mt-1">{item.notes || "No notes added yet."}</p>
                </div>
              </motion.article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
