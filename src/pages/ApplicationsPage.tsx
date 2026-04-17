import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Loader2, MapPin, NotebookPen, PlusCircle, LayoutList } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import type { Application, Job } from "../types";

const statuses = ["Applied", "Interview", "Rejected", "Offer"] as const;
type Status = (typeof statuses)[number];

function statusClasses(status: Status) {
  if (status === "Offer") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20";
  if (status === "Interview") return "bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20";
  if (status === "Rejected") return "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20";
  return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";
}

export default function ApplicationsPage() {
  const { toast, success, error: showError } = useToast();
  const [items, setItems] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
    load().catch(() => showError("Failed to load applications."));
  }, []);

  const add = async () => {
    if (!selectedJobId) {
      toast("Please select a target job first.", "info");
      return;
    }

    setAdding(true);
    try {
      await api.createApplication({ jobId: selectedJobId, notes });
      setNotes("");
      await load();
      success("Application added to tracker.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not add application.");
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
    <section className="space-y-6 max-w-7xl mx-auto">
       <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
           <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <LayoutList size={20} />
          </span>
          Application Tracker
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Track your pipeline from apply to offer with clean status management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {statuses.map((status, idx) => {
          const borders = {
            Applied: "bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700",
            Interview: "bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700",
            Offer: "bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700",
            Rejected: "bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700",
          };
          const text = {
            Applied: "text-amber-600 dark:text-amber-400",
            Interview: "text-brand-600 dark:text-brand-400",
            Offer: "text-emerald-600 dark:text-emerald-400",
            Rejected: "text-rose-600 dark:text-rose-400",
          };
          return (
            <motion.article 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={status} 
              className={`rounded-xl p-5 shadow-sm ${borders[status as Status]}`}
            >
               <p className={`text-xs font-semibold uppercase tracking-wider ${text[status as Status]}`}>{status}</p>
               <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{summary[status]}</p>
            </motion.article>
          );
        })}
      </div>

      <article className="saas-card p-6 border-l-4 border-l-brand-500">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Target Job</label>
            <div className="mt-2">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
              >
                {jobs.length === 0 ? <option>No jobs loaded</option> : null}
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
             <div className="mt-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Referral, prep notes, follow-up..."
                className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={add}
              disabled={adding}
              className="inline-flex w-full mt-2 md:mt-0 md:w-auto items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              {adding ? "Adding..." : "Add to Tracker"}
            </button>
          </div>
        </div>
      </article>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="saas-card p-5 animate-pulse flex flex-col justify-between h-[200px]">
              <div className="flex justify-between mb-4">
                <div className="space-y-3 flex-1 mr-4">
                  <div className="h-5 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-8 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-20 w-full rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center saas-card border-2 border-dashed border-slate-300 dark:border-slate-700 text-center p-6">
              <LayoutList size={32} className="mb-3 text-slate-400" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Your pipeline is empty.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a job from above to start tracking your applications.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid gap-4 lg:grid-cols-2"
            >
              {items.map((item) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="saas-card p-5 group flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        <BriefcaseBusiness size={16} className="text-slate-400" />
                        {item.job.title}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                         <span className="font-medium text-slate-700 dark:text-slate-300">{item.job.company}</span>
                         <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-slate-400" />
                          {item.job.location}
                        </span>
                      </div>
                    </div>

                    <select
                      value={item.status}
                      onChange={async (e) => {
                        try {
                          await api.updateApplication(item._id, { status: e.target.value, notes: item.notes });
                          await load();
                          toast(`Status updated to ${e.target.value}`, "info");
                        } catch (err) {
                          showError("Failed to update status");
                        }
                      }}
                      className={`cursor-pointer rounded-md border-0 py-1.5 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset focus:ring-2 focus:ring-brand-500 sm:leading-6 ${statusClasses(item.status as Status)}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status} className="bg-white dark:bg-slate-900 font-medium normal-case text-slate-900 dark:text-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 p-4 ring-1 ring-inset ring-slate-200 dark:ring-slate-700/50 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                       <NotebookPen size={12} />
                       Notes
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.notes || "No notes added yet."}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
