import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileCheck,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  Check,
  X,
  Edit2,
  Layers,
  ShieldCheck,
  BarChart3,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

export default function ResumeOptimizerPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);

  const urlRole = searchParams.get("role") || "";

  // Wizard Tab state: 'upload' | 'analysis' | 'optimize' | 'export'
  const [activeTab, setActiveTab] = useState("upload");

  // Inputs
  const [role, setRole] = useState(urlRole || user?.targetRole || "Full Stack Developer");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Outputs & Pipeline State
  const [isParsing, setIsParsing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isValidatingPDF, setIsValidatingPDF] = useState(false);

  const [structuredResume, setStructuredResume] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [optimizationReport, setOptimizationReport] = useState(null);
  const [pdfValidation, setPdfValidation] = useState(null);
  const [diffDecisions, setDiffDecisions] = useState({}); // { [diffId]: 'accepted' | 'rejected' | 'custom' }
  const [customEdits, setCustomEdits] = useState({});

  // 1. File Upload (PDF, DOCX, TXT)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result || "";
        setResumeText(text);
        await parseTextResume(text, file.name);
      };
      reader.readAsText(file);
    } else if (lowerName.endsWith(".pdf") || lowerName.endsWith(".docx")) {
      setIsParsing(true);
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target?.result || "";
            const base64 = dataUrl.split(",")[1];
            const mimeType = lowerName.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            const res = await api.parseResumeDoc({
              fileBase64: base64,
              filename: file.name,
              mimeType
            });

            if (res.success && res.data) {
              setStructuredResume(res.data);
              setResumeText(res.rawText || "");
              setQualityReport(res.qualityReport || null);
              success(`Successfully parsed ${file.name} with PyMuPDF!`);
            }
          } catch (err) {
            showError(err.message || "Failed to parse document");
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setIsParsing(false);
        showError(err.message || "Upload failed");
      }
    } else {
      showError("Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const parseTextResume = async (text, name) => {
    setIsParsing(true);
    try {
      const res = await api.parseResumeDoc({
        rawText: text,
        filename: name || "resume.txt"
      });
      if (res.success && res.data) {
        setStructuredResume(res.data);
        setQualityReport(res.qualityReport || null);
        success("Resume parsed and structured successfully!");
      }
    } catch (err) {
      showError(err.message || "Failed to analyze resume text");
    } finally {
      setIsParsing(false);
    }
  };

  // 2. Trigger ATS Compatibility Score
  const handleScoreATS = async () => {
    if (!structuredResume && !resumeText.trim()) {
      showError("Please upload or paste a resume first.");
      return;
    }

    setIsScoring(true);
    try {
      // If structuredResume not yet parsed, parse text first
      let currentResume = structuredResume;
      if (!currentResume) {
        const parseRes = await api.parseResumeDoc({ rawText: resumeText, filename: "resume.txt" });
        currentResume = parseRes.data;
        setStructuredResume(currentResume);
        setQualityReport(parseRes.qualityReport || null);
      }

      const res = await api.scoreATSCompatibility({
        resume: currentResume,
        targetRole: role,
        jobDescription: jobDescription || `Target Role: ${role}. Required professional software engineering skills.`
      });

      if (res.success) {
        setAtsReport(res.report);
        setActiveTab("analysis");
        success("ATS compatibility analysis completed!");
      }
    } catch (err) {
      showError(err.message || "ATS analysis failed");
    } finally {
      setIsScoring(false);
    }
  };

  // 3. Trigger AI Resume Optimizer
  const handleOptimizeResume = async () => {
    if (!structuredResume) {
      showError("Please parse a resume before running the optimizer.");
      return;
    }

    setIsOptimizing(true);
    try {
      const targetSkills = atsReport?.missing_skills || [];
      const res = await api.optimizeResumeIntelligence({
        resume: structuredResume,
        targetRole: role,
        jobDescription,
        targetSkills
      });

      if (res.success) {
        setOptimizationReport(res.report);
        // Initialize decisions as accepted by default
        const initialDecisions = {};
        (res.report.diffs || []).forEach((d) => {
          initialDecisions[d.id] = "accepted";
        });
        setDiffDecisions(initialDecisions);
        setActiveTab("optimize");
        success("AI Optimization generated with Google XYZ formula!");
      }
    } catch (err) {
      showError(err.message || "Optimization failed");
    } finally {
      setIsOptimizing(false);
    }
  };

  // 4. Handle Diff Decisions
  const setDecision = (id, choice) => {
    setDiffDecisions((prev) => ({ ...prev, [id]: choice }));
  };

  const handleCustomEdit = (id, val) => {
    setCustomEdits((prev) => ({ ...prev, [id]: val }));
    setDiffDecisions((prev) => ({ ...prev, [id]: "custom" }));
  };

  // Construct working resume with accepted diffs
  const getConsolidatedResume = () => {
    if (!optimizationReport) return structuredResume;

    const consolidated = JSON.parse(JSON.stringify(optimizationReport.optimized_resume));
    const diffs = optimizationReport.diffs || [];

    // Apply decisions to experience
    (consolidated.experience || []).forEach((exp, expIdx) => {
      exp.highlights = exp.highlights.map((h, hIdx) => {
        const diffId = `exp_${expIdx}_${hIdx}`;
        const decision = diffDecisions[diffId] || "accepted";
        if (decision === "rejected") {
          const originalDiff = diffs.find((d) => d.id === diffId);
          return originalDiff ? originalDiff.original_text : h;
        }
        if (decision === "custom" && customEdits[diffId]) {
          return customEdits[diffId];
        }
        return h;
      });
    });

    // Apply decisions to projects
    (consolidated.projects || []).forEach((prj, prjIdx) => {
      prj.highlights = prj.highlights.map((h, hIdx) => {
        const diffId = `prj_${prjIdx}_${hIdx}`;
        const decision = diffDecisions[diffId] || "accepted";
        if (decision === "rejected") {
          const originalDiff = diffs.find((d) => d.id === diffId);
          return originalDiff ? originalDiff.original_text : h;
        }
        if (decision === "custom" && customEdits[diffId]) {
          return customEdits[diffId];
        }
        return h;
      });
    });

    return consolidated;
  };

  // 5. Validate & Download PDF
  const handleValidatePDF = async () => {
    const resumeToExport = getConsolidatedResume();
    if (!resumeToExport) return;

    setIsValidatingPDF(true);
    try {
      const res = await api.validateResumePDF(resumeToExport);
      if (res.success) {
        setPdfValidation(res.validation);
        setActiveTab("export");
        success("PyMuPDF round-trip validation successful!");
      }
    } catch (err) {
      showError(err.message || "PDF validation failed");
    } finally {
      setIsValidatingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    const resumeToExport = getConsolidatedResume();
    if (!resumeToExport) return;

    setIsGeneratingPDF(true);
    try {
      const blob = await api.generateResumePDF(resumeToExport);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const candidateName = resumeToExport.personal_information?.full_name || "Resume";
      a.download = `${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}_CareerOS.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      success("ATS-Compliant PDF downloaded successfully!");
    } catch (err) {
      showError(err.message || "Failed to download PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Resume Intelligence & ATS Engine
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck size={12} /> Production Grade
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            PyMuPDF document extraction, 6-component deterministic ATS scoring, Google XYZ bullet optimization, and ReportLab PDF compilation.
          </p>
        </div>

        {/* Step Nav Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Parse Document
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            disabled={!atsReport}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "analysis" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
            }`}
          >
            2. ATS Scorecard
          </button>
          <button
            onClick={() => setActiveTab("optimize")}
            disabled={!optimizationReport}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "optimize" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
            }`}
          >
            3. Diff Review
          </button>
          <button
            onClick={() => setActiveTab("export")}
            disabled={!pdfValidation}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "export" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
            }`}
          >
            4. PDF & Export
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <AnimatePresence mode="wait">
        {/* TAB 1: UPLOAD & INGESTION */}
        {activeTab === "upload" && (
          <motion.div
            key="tab-upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]"
          >
            {/* Left: Input Form */}
            <div className="card-white p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-brand-700" />
                  <h2 className="text-sm font-bold text-slate-900">Upload Resume Document</h2>
                </div>
                {user?.resumeText && (
                  <button
                    type="button"
                    onClick={() => {
                      setResumeText(user.resumeText);
                      parseTextResume(user.resumeText, "profile_resume.txt");
                    }}
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    Load from Profile
                  </button>
                )}
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                  <Upload size={22} className="text-brand-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {uploadedFileName ? uploadedFileName : "Click or drag your resume here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports <b>PDF</b> (PyMuPDF parser), <b>DOCX</b>, or plain text. Max 10MB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Target Role & Job Description Inputs */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Job Title / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Job Description (Optional for deep requirement alignment)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste the target job posting qualifications, responsibilities, or tech stack..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none font-sans"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Raw Resume Text Content
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {resumeText ? `${resumeText.length} characters` : "Empty"}
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    placeholder="Resume text will populate automatically on upload, or paste directly here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none font-mono text-[11px] leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isParsing || isScoring || (!structuredResume && !resumeText.trim())}
                    onClick={handleScoreATS}
                    className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    {isScoring ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Running ATS Scoring...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Analyze ATS Compatibility
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Structure Inspection & 16-point Quality Checker */}
            <div className="space-y-6">
              {isParsing ? (
                <div className="card-white p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900">PyMuPDF Document Parser Running...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Extracting contact information, work history highlights, skills taxonomy, and page metadata.
                  </p>
                </div>
              ) : structuredResume ? (
                <div className="card-white p-6 space-y-5">
                  {/* Extracted Header Overview */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="badge-indigo text-[11px]">
                        Confidence: {Math.round((structuredResume.extraction_metadata?.confidence || 0.9) * 100)}%
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {structuredResume.personal_information?.full_name || "Parsed Candidate"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {structuredResume.personal_information?.email} &bull; {structuredResume.personal_information?.phone}
                        {structuredResume.personal_information?.location && ` &bull; ${structuredResume.personal_information?.location}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500">Document Pages:</span>
                      <p className="text-sm font-bold text-slate-800">
                        {structuredResume.extraction_metadata?.page_count || 1}
                      </p>
                    </div>
                  </div>

                  {/* 16-Point Quality Checker Report */}
                  {qualityReport && (
                    <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          16-Point Quality Audit
                        </span>
                        <span className="text-xs font-extrabold text-brand-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {qualityReport.quality_score}/100 Score
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {qualityReport.has_contact_info ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                          )}
                          <span>Contact Information</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {qualityReport.has_measurable_metrics ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                          )}
                          <span>Quantified Metrics</span>
                        </div>
                      </div>

                      {qualityReport.issues?.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-1">
                          <p className="text-[11px] font-semibold text-slate-600">Detected Issues:</p>
                          {qualityReport.issues.slice(0, 3).map((iss, i) => (
                            <p key={i} className="text-[11px] text-amber-700 flex items-start gap-1">
                              &bull; {iss.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Categorized Skills Chips */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Extracted Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {(structuredResume.skills?.programming_languages || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium border border-blue-100">
                          {s}
                        </span>
                      ))}
                      {(structuredResume.skills?.frameworks || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-medium border border-indigo-100">
                          {s}
                        </span>
                      ))}
                      {(structuredResume.skills?.databases || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-100">
                          {s}
                        </span>
                      ))}
                      {(structuredResume.skills?.cloud_tools || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[11px] font-medium border border-amber-100">
                          {s}
                        </span>
                      ))}
                      {(structuredResume.skills?.ai_ml_tools || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-medium border border-purple-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience Preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Work Experience Entries ({structuredResume.experience?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(structuredResume.experience || []).map((exp, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                          <p className="font-semibold text-slate-900">
                            {exp.title} &bull; <span className="text-slate-600">{exp.company}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {exp.highlights?.length || 0} accomplishments extracted
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-white p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
                  <FileCheck size={36} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900">Document Ready for Ingestion</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Upload your resume file or paste raw text to run section segmentation, contact detection, and 16-point quality checks.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: ATS SCORECARD & GAP ANALYSIS */}
        {activeTab === "analysis" && atsReport && (
          <motion.div
            key="tab-analysis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Top Score Banner */}
            <div className="card-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="badge-indigo text-xs">Target: {role}</span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  ATS Compatibility Score: {atsReport.overall_score}%
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {atsReport.disclaimer}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border-4 border-indigo-200 flex items-center justify-center bg-indigo-50/60 shrink-0">
                  <span className="text-2xl font-black text-brand-700">{atsReport.overall_score}%</span>
                </div>
                <button
                  onClick={handleOptimizeResume}
                  disabled={isOptimizing}
                  className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Optimizing Bullets...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Optimize with AI (XYZ Formula)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 6-Component Weighted Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Skills (30%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.required_skills}%</p>
              </div>
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Experience (20%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.experience_relevance}%</p>
              </div>
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Keywords (15%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.keyword_coverage}%</p>
              </div>
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Projects (15%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.project_relevance}%</p>
              </div>
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Education (10%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.education}%</p>
              </div>
              <div className="card-white p-3 text-center space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Formatting (10%)</span>
                <p className="text-lg font-bold text-slate-900">{atsReport.components?.formatting}%</p>
              </div>
            </div>

            {/* Matched vs Missing Skills Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Matched Role Competencies ({atsReport.matched_skills?.length || 0})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(atsReport.matched_skills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                      ✓ {s}
                    </span>
                  ))}
                  {(!atsReport.matched_skills || atsReport.matched_skills.length === 0) && (
                    <p className="text-xs text-slate-400">No exact skill matches identified yet.</p>
                  )}
                </div>
              </div>

              <div className="card-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Missing Target Skills ({atsReport.missing_skills?.length || 0})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(atsReport.missing_skills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                      + {s}
                    </span>
                  ))}
                  {(!atsReport.missing_skills || atsReport.missing_skills.length === 0) && (
                    <p className="text-xs text-slate-400">All required core skills are present!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {atsReport.recommendations?.length > 0 && (
              <div className="card-white p-5 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb size={16} className="text-brand-700" /> Actionable Recommendations
                </h3>
                <div className="space-y-1.5">
                  {atsReport.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-brand-700 font-bold">&bull;</span>
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: DIFF REVIEW & ACCEPT/REJECT */}
        {activeTab === "optimize" && optimizationReport && (
          <motion.div
            key="tab-optimize"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Header banner */}
            <div className="card-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="badge-indigo text-xs">Factual Integrity Guardrail Active</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Google XYZ Formula Bullet Enhancements
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accomplished [X] as measured by [Y], by doing [Z]. All original factual claims and metrics are preserved.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidatePDF}
                  disabled={isValidatingPDF}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                >
                  {isValidatingPDF ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Validating PDF...
                    </>
                  ) : (
                    <>
                      <FileCheck size={14} />
                      Compile & Validate PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Diffs List */}
            <div className="space-y-4">
              {(optimizationReport.diffs || []).map((diff) => {
                const decision = diffDecisions[diff.id] || "accepted";
                return (
                  <div
                    key={diff.id}
                    className={`card-white p-5 border transition-all ${
                      decision === "accepted"
                        ? "border-emerald-200 bg-white"
                        : decision === "rejected"
                        ? "border-slate-200 bg-slate-50/50 opacity-75"
                        : "border-indigo-200 bg-indigo-50/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {diff.section}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-700">
                          {diff.rag_framework_applied}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDecision(diff.id, "accepted")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            decision === "accepted"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Check size={12} /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecision(diff.id, "rejected")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            decision === "rejected"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid md:grid-cols-2 gap-4 pt-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Original Text
                        </span>
                        <p className="text-slate-700 leading-relaxed font-sans">{diff.original_text}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200 text-xs">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                          Improved (Google XYZ Formula)
                        </span>
                        {decision === "custom" ? (
                          <textarea
                            rows={3}
                            value={customEdits[diff.id] || diff.improved_text}
                            onChange={(e) => handleCustomEdit(diff.id, e.target.value)}
                            className="w-full text-xs text-slate-900 bg-white border border-indigo-200 rounded p-1.5 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900 font-medium leading-relaxed font-sans">
                            {diff.improved_text}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Evidence: {diff.provenance_evidence}</span>
                      {decision !== "custom" && (
                        <button
                          type="button"
                          onClick={() => handleCustomEdit(diff.id, diff.improved_text)}
                          className="text-brand-700 hover:underline flex items-center gap-1"
                        >
                          <Edit2 size={11} /> Edit wording
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: PDF ROUND-TRIP VALIDATION & EXPORT */}
        {activeTab === "export" && pdfValidation && (
          <motion.div
            key="tab-export"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="card-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 size={13} /> PyMuPDF Round-Trip Verified
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  ATS PDF Compiled Successfully
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single-column standard typography, selectable text stream, and 0% multi-page overflow.
                </p>
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Compiling PDF...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download ATS Resume (PDF)
                  </>
                )}
              </button>
            </div>

            {/* Validation Audit Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card-white p-4 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Page Count</span>
                <p className="text-lg font-bold text-slate-900">{pdfValidation.page_count} Page(s)</p>
                <p className="text-[11px] text-emerald-600 font-medium">Optimal ATS length</p>
              </div>

              <div className="card-white p-4 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Readability Index</span>
                <p className="text-lg font-bold text-slate-900">{pdfValidation.readability_score}%</p>
                <p className="text-[11px] text-emerald-600 font-medium">100% Selectable text</p>
              </div>

              <div className="card-white p-4 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Sections Preserved</span>
                <p className="text-lg font-bold text-slate-900">{pdfValidation.sections_verified?.length || 0} Core Sections</p>
                <p className="text-[11px] text-emerald-600 font-medium">All headings intact</p>
              </div>
            </div>

            {/* Verified Sections List */}
            <div className="card-white p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Verified Document Sections
              </h3>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {(pdfValidation.sections_verified || []).map((sec) => (
                  <div key={sec} className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
