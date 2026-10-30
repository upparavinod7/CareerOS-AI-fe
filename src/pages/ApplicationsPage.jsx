import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Kanban,
  LayoutList,
  Loader2,
  MapPin,
  MoreVertical,
  NotebookPen,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { APPLICATION_STATUSES } from "../types";

export default function ApplicationsPage() {
  const { success, error: showError } = useToast();

  const [items, setItems] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "table"
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Adding Application
  const [modalOpen, setModalOpen] = useState(false);
  const [addMode, setAddMode] = useState("custom"); // "job" or "custom"
  const [selectedJobId, setSelectedJobId] = useState("");
  const [customForm, setCustomForm] = useState({
    company: "",
    jobTitle: "",
    location: "Remote",
    salary: "",
    jobUrl: "",
    recruiterName: "",
    recruiterEmail: "",
    status: "Applied",
    notes: "",
    interviewDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadApplications = useCallback(async (queryParam) => {
    try {
      setLoading(true);
      const q = typeof queryParam === "string" ? queryParam : searchQuery;
      const [apps, jobsRes] = await Promise.all([
        api.listApplications({ status: statusFilter, q }),
        api.searchJobs({ page: 1, limit: 30, sort: "recent" }),
      ]);
      setItems(apps || []);
      setJobs(jobsRes.items || []);
      if (jobsRes.items?.length > 0) {
        setSelectedJobId((prev) => prev || jobsRes.items[0]._id);
      }
    } catch (err) {
      showError(err.message || "Failed to load application tracker");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showError]);

  useEffect(() => {
    loadApplications();
  }, [statusFilter, loadApplications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadApplications(searchQuery);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      setItems((prev) =>
        prev.map((item) => ((item._id || item.id) === appId ? { ...item, status: newStatus } : item))
      );
      success(`Updated stage to ${newStatus}`);
    } catch (err) {
      showError(err.message || "Failed to update application status");
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this tracked application?")) return;
    try {
      await api.deleteApplication(appId);
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== appId));
      success("Application removed from tracker.");
    } catch (err) {
      showError(err.message || "Failed to delete application");
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload = {};
      if (addMode === "job") {
        if (!selectedJobId) {
          showError("Please select a target job from the list.");
          setSubmitting(false);
          return;
        }
        payload = {
          jobId: selectedJobId,
          status: customForm.status,
          notes: customForm.notes,
        };
      } else {
        if (!customForm.company.trim() || !customForm.jobTitle.trim()) {
          showError("Company name and Job title are required.");
          setSubmitting(false);
          return;
        }
        payload = { ...customForm };
      }

      await api.createApplication(payload);
      success("Application successfully added to tracker!");
      setModalOpen(false);
      setCustomForm({
        company: "",
        jobTitle: "",
        location: "Remote",
        salary: "",
        jobUrl: "",
        recruiterName: "",
        recruiterEmail: "",
        status: "Applied",
        notes: "",
        interviewDate: "",
      });
      await loadApplications();
    } catch (err) {
      showError(err.message || "Failed to add application");
    } finally {
      setSubmitting(false);
    }
  };

  // Group items by status for Kanban view
  const kanbanColumns = [
    { id: "Interested", label: "Interested", badge: "badge-slate" },
    { id: "Applied", label: "Applied", badge: "badge-indigo" },
    { id: "Assessment", label: "Assessment", badge: "badge-amber" },
    { id: "Interview", label: "Interview", badge: "badge-indigo font-bold" },
    { id: "Offer", label: "Offer Won", badge: "badge-emerald font-bold" },
    { id: "Rejected", label: "Archived / Rejected", badge: "badge-rose" },
  ];

  const countsByStatus = useMemo(() => {
    const acc = {};
    APPLICATION_STATUSES.forEach((s) => (acc[s] = 0));
    items.forEach((item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
    });
    return acc;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your pipeline from initial discovery through interviews and accepted offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "kanban" ? "bg-brand-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban size={13} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "table" ? "bg-brand-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutList size={13} />
              Table
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <Plus size={14} />
            Add Application
          </button>
        </div>
      </div>

      {/* Stage KPI Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kanbanColumns.map((col) => (
          <div
            key={col.id}
            onClick={() => setStatusFilter(statusFilter === col.id ? "All" : col.id)}
            className={`card-white p-3 cursor-pointer transition-all ${
              statusFilter === col.id ? "ring-2 ring-brand-700 bg-indigo-50/20" : "hover:border-slate-300"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{col.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{countsByStatus[col.id] || 0}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Header */}
      <div className="card-white p-3 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by company, role title, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Stages ({items.length})</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({countsByStatus[s] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-white p-12 text-center">
          <LayoutList size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">Your application tracker is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Add Application" or browse the Job Board to track opportunities and schedule interview rounds.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs mt-4">
            <Plus size={13} />
            Track Your First Job
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colItems = items.filter(
              (item) => item.status === col.id || (col.id === "Rejected" && item.status === "Withdrawn")
            );

            return (
              <div key={col.id} className="bg-slate-100/70 rounded-xl p-3 flex flex-col min-h-[350px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700">{col.label}</span>
                  <span className="h-5 w-5 rounded-full bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] soft-scroll pr-0.5">
                  {colItems.map((app) => {
                    const appId = app._id || app.id;
                    const title = app.jobTitle || app.job?.title || "Role";
                    const company = app.company || app.job?.company || "Company";

                    return (
                      <div
                        key={appId}
                        className="card-white p-3.5 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{title}</h4>
                            <button
                              onClick={() => handleDelete(appId)}
                              className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors shrink-0"
                              title="Delete application"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 mt-0.5 truncate">{company}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin size={10} />
                            {app.location || app.job?.location || "Remote"}
                          </p>
                        </div>

                        {app.notes && (
                          <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {app.notes}
                          </div>
                        )}

                        {app.interviewDate && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-brand-700 bg-brand-50 p-1.5 rounded">
                            <Calendar size={11} />
                            {new Date(app.interviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(appId, e.target.value)}
                            className="text-[10px] font-semibold rounded border border-slate-200 bg-white py-0.5 px-1.5 text-slate-700 cursor-pointer"
                          >
                            {APPLICATION_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-slate-400">
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {colItems.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-medium">No roles</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Interview Schedule</th>
                  <th className="py-3 px-4">Recruiter</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {items.map((app) => {
                  const appId = app._id || app.id;
                  const title = app.jobTitle || app.job?.title || "Role";
                  const company = app.company || app.job?.company || "Company";

                  return (
                    <tr key={appId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{title}</p>
                        <p className="text-slate-500 font-medium">{company}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{app.location || "Remote"}</td>
                      <td className="py-3 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(appId, e.target.value)}
                          className="rounded border border-slate-200 bg-white py-1 px-2 text-xs font-medium text-slate-800 cursor-pointer"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {app.interviewDate ? (
                          <span className="flex items-center gap-1 font-semibold text-brand-700">
                            <Calendar size={12} />
                            {new Date(app.interviewDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {app.recruiterName ? (
                          <div>
                            <p className="font-medium text-slate-800">{app.recruiterName}</p>
                            <p className="text-[10px] text-slate-400">{app.recruiterEmail}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{app.notes || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(appId)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="card-white w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-brand-700" />
                  <h3 className="text-base font-bold text-slate-900">Add New Application</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Toggle: Pick from Job Feed OR Custom */}
              <div className="px-6 pt-4">
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setAddMode("custom")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      addMode === "custom" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Custom Role Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode("job")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      addMode === "job" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Select from Job Board
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateApplication} className="p-6 overflow-y-auto soft-scroll space-y-4 text-xs">
                {addMode === "job" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Feed Job</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                    >
                      {jobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.title} — {job.company} ({job.location})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Acme Corp"
                          value={customForm.company}
                          onChange={(e) => setCustomForm({ ...customForm, company: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Senior Frontend Engineer"
                          value={customForm.jobTitle}
                          onChange={(e) => setCustomForm({ ...customForm, jobTitle: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Remote, San Francisco"
                          value={customForm.location}
                          onChange={(e) => setCustomForm({ ...customForm, location: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                        <input
                          type="text"
                          placeholder="e.g. $120k - $150k"
                          value={customForm.salary}
                          onChange={(e) => setCustomForm({ ...customForm, salary: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">External Job Posting URL</label>
                      <input
                        type="url"
                        placeholder="https://company.com/jobs/..."
                        value={customForm.jobUrl}
                        onChange={(e) => setCustomForm({ ...customForm, jobUrl: e.target.value })}
                        className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={customForm.recruiterName}
                          onChange={(e) => setCustomForm({ ...customForm, recruiterName: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Email</label>
                        <input
                          type="email"
                          placeholder="sarah@company.com"
                          value={customForm.recruiterEmail}
                          onChange={(e) => setCustomForm({ ...customForm, recruiterEmail: e.target.value })}
                          className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Application Stage</label>
                    <select
                      value={customForm.status}
                      onChange={(e) => setCustomForm({ ...customForm, status: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Upcoming Interview Date</label>
                    <input
                      type="date"
                      value={customForm.interviewDate}
                      onChange={(e) => setCustomForm({ ...customForm, interviewDate: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                    >
                    </input>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Interview prep pointers, referral context, follow-up timeline..."
                    value={customForm.notes}
                    onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {submitting ? "Adding..." : "Add to Tracker"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
