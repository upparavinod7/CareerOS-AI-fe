import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  History,
  Info,
  Layers,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function AutoApplyPage() {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // overview | accounts | matching | queue | history | settings
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [settings, setSettings] = useState(null);
  const [resumes, setResumes] = useState([]);

  // Modals
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [guidedModalData, setGuidedModalData] = useState(null);
  const [connectModalProvider, setConnectModalProvider] = useState(null);
  const [connectForm, setConnectForm] = useState({ boardToken: "", site: "", apiKey: "" });

  // Action states
  const [processingId, setProcessingId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [guidedConfirmationId, setGuidedConfirmationId] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, intRes, accRes, jobsRes, qRes, histRes, setRes, resRes] = await Promise.all([
        api.getAutoApplyOverview().catch(() => null),
        api.getIntegrations().catch(() => []),
        api.getConnectedAccounts().catch(() => []),
        api.getAutoApplyJobs().catch(() => []),
        api.getAutoApplyQueue().catch(() => []),
        api.getAutoApplyHistory().catch(() => []),
        api.getAutoApplySettings().catch(() => null),
        api.listResumes().catch(() => []),
      ]);

      setOverview(ovRes);
      setIntegrations(intRes || []);
      setConnectedAccounts(accRes || []);
      setMatchingJobs(jobsRes || []);
      setQueue(qRes || []);
      setHistoryList(histRes || []);
      setSettings(setRes);
      setResumes(resRes || []);
    } catch (err) {
      showError(err.message || "Failed to load Auto Apply intelligence");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showSuccess(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Toggle Pause/Resume
  const handleTogglePause = async () => {
    if (!settings) return;
    try {
      const nextPaused = !settings.isPaused;
      await api.updateAutoApplySettings({ isPaused: nextPaused });
      setSettings((prev) => ({ ...prev, isPaused: nextPaused }));
      showSuccess(nextPaused ? "Auto Apply agent paused." : "Auto Apply agent active.");
    } catch (err) {
      showError(err.message || "Failed to update status");
    }
  };

  // Prepare draft application from matching job
  const handlePrepare = async (jobId) => {
    try {
      setProcessingId(jobId);
      const newApp = await api.prepareAutoApply(jobId);
      showSuccess("Application package prepared and added to queue!");
      setQueue((prev) => [newApp, ...prev]);
      setMatchingJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, hasApplied: true, applicationStatus: "Awaiting Approval" } : j))
      );
      setReviewModalApp(newApp);
    } catch (err) {
      showError(err.message || "Failed to prepare application draft");
    } finally {
      setProcessingId(null);
    }
  };

  // Approve application
  const handleApprove = async (appId) => {
    try {
      setProcessingId(appId);
      const updated = await api.approveAutoApply(appId, "Approved by candidate");
      showSuccess("Application approved and ready to submit!");
      setQueue((prev) => prev.map((a) => (a._id === appId ? updated : a)));
      if (reviewModalApp && reviewModalApp._id === appId) {
        setReviewModalApp(updated);
      }
    } catch (err) {
      showError(err.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  // Reject / Dismiss application
  const handleReject = async (appId) => {
    try {
      setProcessingId(appId);
      await api.rejectAutoApply(appId, "Dismissed from queue");
      showSuccess("Application dismissed from queue.");
      setQueue((prev) => prev.filter((a) => a._id !== appId));
      setReviewModalApp(null);
    } catch (err) {
      showError(err.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  // Submit application (Direct vs Guided)
  const handleSubmit = async (app) => {
    try {
      setProcessingId(app._id);
      const res = await api.submitAutoApply(app._id);

      if (res.submissionMethod === "direct") {
        showSuccess("Direct application submitted successfully via official integration!");
        setQueue((prev) => prev.filter((a) => a._id !== app._id));
        setHistoryList((prev) => [res.data, ...prev]);
        setReviewModalApp(null);
      } else {
        // Guided flow
        setGuidedModalData({
          application: res.data.application || app,
          guidedPackage: res.data.guidedPackage,
        });
        setReviewModalApp(null);
      }
    } catch (err) {
      showError(err.message || "Submission failed");
    } finally {
      setProcessingId(null);
    }
  };

  // Confirm Guided Submission
  const handleConfirmGuided = async () => {
    if (!guidedModalData) return;
    try {
      setProcessingId(guidedModalData.application._id);
      const updated = await api.confirmGuidedAutoApply(guidedModalData.application._id, {
        confirmationId: guidedConfirmationId.trim() || undefined,
        notes: "Guided application submitted by candidate",
      });
      showSuccess("External application submission recorded!");
      setQueue((prev) => prev.filter((a) => a._id !== guidedModalData.application._id));
      setHistoryList((prev) => [updated, ...prev]);
      setGuidedModalData(null);
      setGuidedConfirmationId("");
    } catch (err) {
      showError(err.message || "Failed to confirm submission");
    } finally {
      setProcessingId(null);
    }
  };

  // Connect Account Flow
  const handleConnect = async (provider) => {
    const provId = provider.providerId;
    if (provId === "greenhouse" || provId === "lever") {
      setConnectModalProvider(provider);
      setConnectForm({ boardToken: "", site: "", apiKey: "" });
    } else {
      try {
        const res = await api.getConnectUrl(provId);
        if (res.authUrl) {
          // In real OAuth, redirect window.location.href = res.authUrl;
          // For demo/sandbox mock, exchange code directly
          const authRes = await api.connectAccount(provId, {
            code: "mock_oauth_code_" + Date.now(),
            state: res.stateToken,
          });
          showSuccess(`${provider.providerName} connected successfully!`);
          setConnectedAccounts((prev) => [
            ...prev.filter((a) => a.provider !== provId),
            authRes,
          ]);
        }
      } catch (err) {
        showError(err.message || "Connection failed");
      }
    }
  };

  const handleSaveCredentials = async () => {
    if (!connectModalProvider) return;
    try {
      const res = await api.connectAccount(connectModalProvider.providerId, connectForm);
      showSuccess(`${connectModalProvider.providerName} credentials saved!`);
      setConnectedAccounts((prev) => [
        ...prev.filter((a) => a.provider !== connectModalProvider.providerId),
        res,
      ]);
      setConnectModalProvider(null);
    } catch (err) {
      showError(err.message || "Failed to save configuration");
    }
  };

  const handleDisconnect = async (providerId) => {
    try {
      await api.disconnectAccount(providerId);
      showSuccess(`Disconnected ${providerId} account.`);
      setConnectedAccounts((prev) => prev.filter((a) => a.provider !== providerId));
    } catch (err) {
      showError(err.message || "Disconnect failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const isPaused = settings?.isPaused ?? false;
  const submittedToday = overview?.dailyProgress?.submittedToday || 0;
  const dailyTarget = overview?.dailyProgress?.dailyTarget || 10;
  const targetPct = Math.min(100, Math.round((submittedToday / dailyTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Auto Apply Agent</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              <Sparkles size={12} />
              Multi-Platform
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Intelligently prepare tailored applications, verify questions, and submit via authorized APIs or guided workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isPaused
                ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? "Agent Paused (Resume)" : "Agent Active"}
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Progress & Target Meter */}
      <div className="card-white p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-bold">
            <Zap size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Daily Submission Target</div>
            <div className="text-base font-bold text-slate-900">
              {submittedToday} of {dailyTarget} Applications Today
            </div>
          </div>
        </div>

        <div className="w-full md:w-80">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress: {targetPct}%</span>
            <span>Target: {dailyTarget}/day</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${targetPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Explicit consent required for all submissions</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Overview", icon: Layers, count: null },
          { id: "queue", label: "Application Queue", icon: Clock, count: queue.length },
          { id: "matching", label: "Matching Opportunities", icon: Sparkles, count: matchingJobs.length },
          { id: "accounts", label: "Connected Accounts", icon: Link2, count: connectedAccounts.length },
          { id: "history", label: "Submission History", icon: History, count: historyList.length },
          { id: "settings", label: "Automation Settings", icon: Sliders, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-brand-600 text-brand-700 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Discovered Vacancies", val: overview?.totalDiscovered || 0, icon: Briefcase, color: "text-slate-700" },
              { label: "Shortlisted", val: overview?.shortlisted || 0, icon: Sparkles, color: "text-indigo-600" },
              { label: "Awaiting Review", val: overview?.awaitingApproval || 0, icon: Clock, color: "text-amber-600" },
              { label: "Ready to Submit", val: overview?.readyToSubmit || 0, icon: Send, color: "text-blue-600" },
              { label: "Submitted", val: overview?.submitted || 0, icon: CheckCircle2, color: "text-emerald-600" },
              { label: "Interviews & Offers", val: (overview?.interviews || 0) + (overview?.offers || 0), icon: FileCheck, color: "text-purple-600" },
            ].map((kpi, i) => (
              <div key={i} className="card-white p-3.5">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-medium text-slate-500 truncate">{kpi.label}</span>
                  <kpi.icon size={14} className={kpi.color} />
                </div>
                <div className={`text-xl font-bold ${kpi.color}`}>{kpi.val}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Action Queue Card */}
            <div className="lg:col-span-2 card-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Prepared Applications Awaiting Review</h3>
                  <p className="text-xs text-slate-500">Review tailored resumes and screening answers before submission</p>
                </div>
                <button
                  onClick={() => setActiveTab("queue")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View All ({queue.length}) <ChevronRight size={13} />
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
                  <Bot size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">Your application queue is clear</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Explore matching vacancies below to prepare tailored applications.</p>
                  <button
                    onClick={() => setActiveTab("matching")}
                    className="mt-3 btn-secondary text-xs inline-flex items-center gap-1"
                  >
                    <Sparkles size={13} /> Discover Matches
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {queue.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.jobTitle}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-700">
                            {item.platform}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.status === "Ready to Submit"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>{item.company}</span>
                          <span>•</span>
                          <span>{item.location || "Remote"}</span>
                          <span>•</span>
                          <span className="font-semibold text-brand-600">{item.matchScore}% Fit</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReviewModalApp(item)}
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Review & Edit
                        </button>
                        {item.status === "Ready to Submit" ? (
                          <button
                            onClick={() => handleSubmit(item)}
                            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <Send size={12} /> Submit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(item._id)}
                            className="px-3 py-1.5 rounded-md bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Compliance & Safety Card */}
            <div className="card-white p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Candidate Safety & Compliance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                CareerOS complies strictly with external platform terms, OAuth permission scopes, and candidate protection standards:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Password Storage:</strong> We never ask for or store your LinkedIn or Indeed passwords.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Transparent Capabilities:</strong> Direct submissions are only executed on authorized ATS APIs (Greenhouse/Lever).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Guided Fallback:</strong> Compliant side-by-side assistant for external platform applications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Encrypted at Rest:</strong> OAuth tokens are AES-256-GCM encrypted in the database.</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("accounts")}
                  className="w-full btn-secondary text-xs"
                >
                  Manage Integrations & Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONNECTED ACCOUNTS */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supported Platforms & ATS Integrations</h3>
              <p className="text-xs text-slate-500">Each provider explicitly declares supported capabilities and connection methods.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((provider) => {
              const connected = connectedAccounts.find(
                (a) => a.provider === provider.providerId && a.status === "connected"
              );

              return (
                <div key={provider.providerId} className="card-white p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{provider.providerName}</h4>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                            {provider.authType.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          connected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {connected ? "Connected" : "Not Connected"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">{provider.disclaimer}</p>

                    {/* Capabilities Badge Grid */}
                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">Declared Capabilities:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <span className="flex items-center gap-1 text-slate-600">
                          {provider.authentication ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-400" />}
                          Auth / OAuth
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          {provider.jobDiscovery ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-400" />}
                          Job Discovery
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          {provider.applicationPreparation ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-400" />}
                          AI Prep Drafts
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          {provider.applicationSubmission ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <span className="text-amber-600 font-semibold">Guided Assistant</span>
                          )}
                          {provider.applicationSubmission ? "Direct API Submit" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {connected ? (
                      <button
                        onClick={() => handleDisconnect(provider.providerId)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider)}
                        className="btn-primary text-xs w-full py-1.5 flex items-center justify-center gap-1.5"
                      >
                        <Link2 size={13} />
                        {provider.providerId === "greenhouse" || provider.providerId === "lever"
                          ? "Configure Credentials"
                          : "Connect Account"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MATCHING OPPORTUNITIES */}
      {activeTab === "matching" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Matching Opportunities</h3>
              <p className="text-xs text-slate-500">
                Ranked by explainable job-fit score. Minimum match threshold: {settings?.minMatchScore || 70}%.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Found {matchingJobs.length} eligible vacancies</span>
          </div>

          {matchingJobs.length === 0 ? (
            <div className="py-12 card-white text-center">
              <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700">No jobs meet your current filter threshold</p>
              <p className="text-[11px] text-slate-400 mt-1">Try adjusting your target roles or lowering minimum match score in Settings.</p>
              <button onClick={() => setActiveTab("settings")} className="mt-3 btn-secondary text-xs">
                Adjust Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingJobs.map((job) => (
                <div
                  key={job._id}
                  className="card-white p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{job.title}</span>
                      <span className="text-xs font-medium text-slate-600">{job.company}</span>
                      <span className="badge-indigo text-[10px]">{job.workType || "Remote"}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </span>
                      {job.salary && (
                        <span>
                          {job.salary.min ? `$${job.salary.min.toLocaleString()}` : ""} -{" "}
                          {job.salary.max ? `$${job.salary.max.toLocaleString()}` : ""} {job.salary.currency || "USD"}
                        </span>
                      )}
                    </div>

                    {/* Skill Overlap Breakdown */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-semibold text-slate-600">Matching:</span>
                      {(job.matchingSkills || []).slice(0, 5).map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {s}
                        </span>
                      ))}
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <>
                          <span className="text-[11px] font-semibold text-rose-500 ml-2">Missing:</span>
                          {job.missingSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {job.hasApplied ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <Check size={13} /> {job.applicationStatus || "Applied"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePrepare(job._id)}
                        disabled={processingId === job._id}
                        className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2"
                      >
                        {processingId === job._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Bot size={13} />
                        )}
                        Prepare Application
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: APPLICATION QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Queue</h3>
              <p className="text-xs text-slate-500">
                Prepared applications awaiting your final review, answer verification, and approval.
              </p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="py-12 card-white text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-medium text-slate-700">No applications currently in queue</p>
              <p className="text-[11px] text-slate-400 mt-1">Head over to Matching Opportunities to queue new applications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((app) => (
                <div key={app._id} className="card-white p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{app.jobTitle}</span>
                      <span className="text-xs text-slate-600">{app.company}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {app.platform}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          app.submissionMethod === "direct"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {app.submissionMethod === "direct" ? "Direct API" : "Guided Assistant"}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          app.status === "Ready to Submit"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Resume: <strong>{app.resumeTitle}</strong></span>
                      <span>•</span>
                      <span>{app.questionAnswers?.length || 0} Screening Answers Prepared</span>
                      <span>•</span>
                      <span className="font-semibold text-brand-600">{app.matchScore}% Fit Score</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReviewModalApp(app)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Inspect & Edit
                    </button>

                    {app.status === "Ready to Submit" ? (
                      <button
                        onClick={() => handleSubmit(app)}
                        disabled={processingId === app._id}
                        className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                      >
                        {processingId === app._id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        {app.submissionMethod === "direct" ? "Submit via API" : "Launch Guided"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(app._id)}
                        disabled={processingId === app._id}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 flex items-center gap-1"
                      >
                        <Check size={13} /> Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleReject(app._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Dismiss from queue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUBMISSION HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Submission History</h3>
              <p className="text-xs text-slate-500">Verified record of applications submitted directly or confirmed via guided workflow.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">Total: {historyList.length}</span>
          </div>

          {historyList.length === 0 ? (
            <div className="py-12 card-white text-center">
              <History size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700">No submission records yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Applications you submit will appear here with proof of confirmation.</p>
            </div>
          ) : (
            <div className="card-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Role & Company</th>
                    <th className="py-3 px-4">Platform & Method</th>
                    <th className="py-3 px-4">Confirmation ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {historyList.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                        <div className="text-[11px] text-slate-500">{app.company}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{app.platform}</div>
                        <span className="text-[10px] text-slate-500 uppercase">{app.submissionMethod}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {app.providerConfirmation?.confirmationId || "Verified"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                          >
                            Listing <ExternalLink size={12} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AUTOMATION SETTINGS */}
      {activeTab === "settings" && settings && (
        <div className="card-white p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automation Parameters & Guardrails</h3>
            <p className="text-xs text-slate-500">Configure matching thresholds, daily application limits, and candidate approval rules.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Daily Application Cap (Max Attempts per Day)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={settings.dailyApplicationTarget || 10}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, dailyApplicationTarget: Number(e.target.value) }))
                  }
                  className="w-full max-w-xs accent-brand-600"
                />
                <span className="text-xs font-bold text-brand-700 px-2 py-1 rounded bg-indigo-50 border border-indigo-100">
                  {settings.dailyApplicationTarget} applications/day
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Treat this as a maximum cap, never a guarantee. Only matching, suitable applications are processed.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Minimum Match Score Filter ({settings.minMatchScore}%)
              </label>
              <input
                type="range"
                min="40"
                max="95"
                value={settings.minMatchScore || 70}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, minMatchScore: Number(e.target.value) }))
                }
                className="w-full max-w-xs accent-brand-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Only job opportunities scoring above this threshold will appear in your matching feed.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="remoteOnlyToggle"
                checked={settings.remoteOnly || false}
                onChange={(e) => setSettings((prev) => ({ ...prev, remoteOnly: e.target.checked }))}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <label htmlFor="remoteOnlyToggle" className="text-xs font-semibold text-slate-800">
                Strict Remote Only (Exclude hybrid and on-site opportunities)
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="requireApprovalToggle"
                checked={settings.requireApproval ?? true}
                onChange={(e) => setSettings((prev) => ({ ...prev, requireApproval: e.target.checked }))}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <label htmlFor="requireApprovalToggle" className="text-xs font-semibold text-slate-800">
                Always Require Explicit Candidate Approval (Recommended)
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={async () => {
                  try {
                    await api.updateAutoApplySettings(settings);
                    showSuccess("Automation settings saved successfully!");
                  } catch (err) {
                    showError(err.message || "Failed to save settings");
                  }
                }}
                className="btn-primary text-xs px-5 py-2"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INSPECT & APPROVE MODAL */}
      <AnimatePresence>
        {reviewModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Review & Approve Application</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {reviewModalApp.jobTitle} • {reviewModalApp.company} ({reviewModalApp.platform})
                  </div>
                </div>
                <button onClick={() => setReviewModalApp(null)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Match Summary */}
                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-brand-900">Fit Compatibility Score: {reviewModalApp.matchScore}%</div>
                    <div className="text-[11px] text-brand-700 mt-0.5">
                      Destination Platform: {reviewModalApp.platform} ({reviewModalApp.submissionMethod === "direct" ? "Official Direct API" : "Guided Assistant"})
                    </div>
                  </div>
                  <span className="badge-indigo font-bold text-xs">{reviewModalApp.status}</span>
                </div>

                {/* Selected Resume */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attached Resume Version</label>
                  <select
                    value={reviewModalApp.resumeTitle}
                    onChange={(e) => {
                      const sel = resumes.find((r) => r.title === e.target.value);
                      setReviewModalApp((prev) => ({
                        ...prev,
                        resumeTitle: e.target.value,
                        resumeSnapshot: sel ? sel.resumeText : prev.resumeSnapshot,
                      }));
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r.title}>
                        {r.title} {r.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tailored Cover Letter */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tailored Cover Letter</label>
                  <textarea
                    rows={6}
                    value={reviewModalApp.coverLetter || ""}
                    onChange={(e) => setReviewModalApp((prev) => ({ ...prev, coverLetter: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-sans"
                  />
                </div>

                {/* Screening Question Answers */}
                <div>
                  <label className="font-bold text-slate-700 block mb-2">Prepared Screening Answers</label>
                  <div className="space-y-3">
                    {(reviewModalApp.questionAnswers || []).map((qa, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="font-semibold text-slate-800">{qa.question}</div>
                        <input
                          type="text"
                          value={qa.answer || ""}
                          onChange={(e) => {
                            const newAnswers = [...reviewModalApp.questionAnswers];
                            newAnswers[index].answer = e.target.value;
                            setReviewModalApp((prev) => ({ ...prev, questionAnswers: newAnswers }));
                          }}
                          className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <button
                  onClick={() => handleReject(reviewModalApp._id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Reject & Dismiss
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await api.updateAutoApplyAnswers(reviewModalApp._id, {
                          coverLetter: reviewModalApp.coverLetter,
                          questionAnswers: reviewModalApp.questionAnswers,
                          resumeTitle: reviewModalApp.resumeTitle,
                        });
                        showSuccess("Changes saved.");
                      } catch (err) {
                        showError(err.message);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Save Edits
                  </button>

                  <button
                    onClick={async () => {
                      await handleApprove(reviewModalApp._id);
                    }}
                    className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                  >
                    <Check size={13} /> Approve Application
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: GUIDED APPLICATION ASSISTANT MODAL */}
      <AnimatePresence>
        {guidedModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-50/40">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-brand-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Guided Application Assistant</h3>
                    <div className="text-xs text-slate-500">
                      Step-by-step assistant for {guidedModalData.application?.platform || "External Portal"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setGuidedModalData(null)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Step 1: Open external job link */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Step 1: Open Job Vacancy on Platform</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Opens official job posting in a new tab. You complete authentication and final submit.
                    </div>
                  </div>
                  <a
                    href={guidedModalData.guidedPackage?.destinationUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shrink-0"
                  >
                    Open Job Link <ExternalLink size={13} />
                  </a>
                </div>

                {/* Step 2: 1-Click Copy Answers */}
                <div className="space-y-3">
                  <div className="font-bold text-slate-800">Step 2: Copy Tailored Answers to Application Form</div>
                  {(guidedModalData.guidedPackage?.preparedAnswers || []).map((qa, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{qa.question}</span>
                        <button
                          onClick={() => handleCopy(qa.answer, `Answer ${idx + 1}`)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          {copiedField === `Answer ${idx + 1}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          Copy
                        </button>
                      </div>
                      <div className="p-2 bg-slate-50 rounded text-slate-700 font-mono text-[11px]">
                        {qa.answer}
                      </div>
                    </div>
                  ))}

                  {/* Copy Cover Letter */}
                  {guidedModalData.guidedPackage?.coverLetter && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Tailored Cover Letter</span>
                        <button
                          onClick={() => handleCopy(guidedModalData.guidedPackage.coverLetter, "Cover Letter")}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          {copiedField === "Cover Letter" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          Copy Letter
                        </button>
                      </div>
                      <div className="p-2 bg-slate-50 rounded text-slate-700 text-[11px] max-h-28 overflow-y-auto whitespace-pre-wrap">
                        {guidedModalData.guidedPackage.coverLetter}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Candidate Confirmation */}
                <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-3">
                  <div className="font-bold text-emerald-900">Step 3: Confirm Your Submission</div>
                  <p className="text-[11px] text-emerald-800">
                    Once you have submitted on the company website, enter your confirmation number or notes below to record the application in your CareerOS Tracker.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Optional Confirmation # (e.g. LI-987654 or GH-12345)"
                      value={guidedConfirmationId}
                      onChange={(e) => setGuidedConfirmationId(e.target.value)}
                      className="bg-white border border-emerald-300 rounded-lg p-2 text-xs text-slate-800 w-full"
                    />
                    <button
                      onClick={handleConfirmGuided}
                      disabled={processingId === guidedModalData.application?._id}
                      className="btn-primary text-xs px-4 py-2 shrink-0 flex items-center gap-1.5"
                    >
                      {processingId ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Confirm I Submitted
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CONNECT CREDENTIALS MODAL (Greenhouse/Lever) */}
      <AnimatePresence>
        {connectModalProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Configure {connectModalProvider.providerName}</h3>
                <button onClick={() => setConnectModalProvider(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {connectModalProvider.providerId === "greenhouse" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Employer Board Token</label>
                    <input
                      type="text"
                      placeholder="e.g. technova or airbnb"
                      value={connectForm.boardToken}
                      onChange={(e) => setConnectForm((prev) => ({ ...prev, boardToken: e.target.value }))}
                      className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800"
                    />
                  </div>
                )}

                {connectModalProvider.providerId === "lever" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Employer Lever Site Name</label>
                    <input
                      type="text"
                      placeholder="e.g. netflix or figma"
                      value={connectForm.site}
                      onChange={(e) => setConnectForm((prev) => ({ ...prev, site: e.target.value }))}
                      className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Optional API Key / Access Token</label>
                  <input
                    type="password"
                    placeholder="API key (stored encrypted at rest)"
                    value={connectForm.apiKey}
                    onChange={(e) => setConnectForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Credentials are encrypted with AES-256-GCM.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setConnectModalProvider(null)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button onClick={handleSaveCredentials} className="btn-primary text-xs">
                  Save Credentials
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
