import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  UserCircle,
  X,
  Upload,
  Download,
  Sparkles,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  AlertCircle
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { WORK_TYPES } from "../types";

const ROLE_SUGGESTIONS = [
  "Senior AI Engineer",
  "Full Stack Developer",
  "Backend Architect",
  "Frontend Specialist",
  "DevOps & Cloud Engineer",
  "Machine Learning Engineer",
  "Data Scientist"
];

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);
  const versionFileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("general"); // "general", "experience", "resumes", "security"

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [preferredWorkType, setPreferredWorkType] = useState(user?.preferredWorkType || "Remote");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [resumeText, setResumeText] = useState(user?.resumeText || "");
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || "");
  const [hasPdf, setHasPdf] = useState(Boolean(user?.resumeFileBase64));
  const [pdfAtsScore, setPdfAtsScore] = useState(user?.resumeAtsScore || 75);
  const [viewExtractedText, setViewExtractedText] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Skills Array State
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Experience & Education Lists
  const [experiences, setExperiences] = useState(user?.experience || []);
  const [educations, setEducations] = useState(user?.education || []);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Resume Versions State
  const [resumesList, setResumesList] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showAddResumeModal, setShowAddResumeModal] = useState(false);
  const [isUploadingVersionPdf, setIsUploadingVersionPdf] = useState(false);
  const [newResumeForm, setNewResumeForm] = useState({
    title: "",
    targetRole: "",
    resumeText: "",
    skills: "",
    fileName: "",
    fileBase64: "",
    isDefault: false,
  });

  // LLM Tailoring Modal State
  const [tailorModal, setTailorModal] = useState({
    isOpen: false,
    resumeId: "",
    resumeTitle: "",
    currentTargetRole: "",
  });
  const [tailorRole, setTailorRole] = useState("");
  const [tailorJobDescription, setTailorJobDescription] = useState("");
  const [tailorSkills, setTailorSkills] = useState("");
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(true);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);

  const loadResumes = useCallback(async () => {
    try {
      setLoadingResumes(true);
      const res = await api.listResumes();
      setResumesList(res || []);
    } catch {
      // ignore
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "resumes") {
      loadResumes();
    }
  }, [activeTab, loadResumes]);

  // Master PDF Upload handler
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError("Please select a PDF file (.pdf).");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result || "";
          const base64 = dataUrl.split(",")[1];

          const res = await api.uploadResumePdf({
            fileBase64: base64,
            fileName: file.name,
            mimeType: "application/pdf",
            setAsMaster: true,
            createVersion: true,
            title: `Master: ${file.name.replace(/\.pdf$/i, "")}`,
            targetRole: targetRole || user?.targetRole || "Full Stack Engineer"
          });

          if (res.success) {
            setResumeFileName(file.name);
            setHasPdf(true);
            setResumeText(res.rawText || "");
            if (res.atsScore) setPdfAtsScore(res.atsScore);
            if (res.skills && res.skills.length > 0) {
              const merged = Array.from(new Set([...skills, ...res.skills.map((s) => s.toLowerCase())]));
              setSkills(merged);
            }
            await refreshProfile();
            success(`Resume PDF "${file.name}" successfully parsed with PyMuPDF & saved!`);
          }
        } catch (err) {
          showError(err.message || "Failed to process PDF resume");
        } finally {
          setIsUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingPdf(false);
      showError(err.message || "File upload failed");
    }
  };

  // Download Master Resume PDF
  const handleDownloadMasterPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = await api.downloadMasterResumePdfBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", resumeFileName || `${user?.name || "Candidate"}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success("Resume PDF downloaded!");
    } catch (err) {
      showError(err.message || "Failed to download PDF resume");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Download Resume Version PDF
  const handleDownloadVersionPdf = async (id, fileName) => {
    try {
      const blob = await api.downloadResumePdfBlob(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "Resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success("Resume PDF downloaded!");
    } catch (err) {
      showError(err.message || "Failed to download PDF");
    }
  };

  // Open Tailor Modal
  const openTailorModal = (resumeId, resumeTitle, currentRole) => {
    setTailorModal({
      isOpen: true,
      resumeId,
      resumeTitle,
      currentTargetRole: currentRole || targetRole || "Senior AI Engineer",
    });
    setTailorRole(currentRole || targetRole || "Senior AI Engineer");
    setTailorJobDescription("");
    setTailorSkills(skills.slice(0, 6).join(", "));
    setSaveAsNewVersion(true);
    setTailorResult(null);
  };

  // Execute LLM Tailoring
  const handleExecuteTailor = async (e) => {
    e.preventDefault();
    if (!tailorRole.trim()) {
      showError("Target role is required for AI tailoring.");
      return;
    }

    setIsTailoring(true);
    try {
      const payload = {
        targetRole: tailorRole.trim(),
        jobDescription: tailorJobDescription.trim(),
        targetSkills: tailorSkills.split(",").map((s) => s.trim()).filter(Boolean),
        saveAsNewVersion,
        newVersionTitle: `${tailorRole.trim()} (AI Tailored)`
      };

      const res = await api.tailorResumeVersion(tailorModal.resumeId || "master", payload);
      if (res.success) {
        setTailorResult(res);
        success(`Resume tailored with LLM for ${tailorRole}!`);
        await loadResumes();
        await refreshProfile();
      }
    } catch (err) {
      showError(err.message || "Failed to tailor resume with LLM");
    } finally {
      setIsTailoring(false);
    }
  };

  // Upload PDF for new Version modal
  const handleVersionPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showError("Please select a PDF file.");
      return;
    }

    setIsUploadingVersionPdf(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result || "";
          const base64 = dataUrl.split(",")[1];

          const res = await api.parseResumeDoc({
            fileBase64: base64,
            filename: file.name,
            mimeType: "application/pdf"
          });

          if (res.success && res.data) {
            const extractedSkills = [];
            if (res.data.skills) {
              Object.values(res.data.skills).forEach((arr) => {
                if (Array.isArray(arr)) extractedSkills.push(...arr);
              });
            }

            setNewResumeForm((prev) => ({
              ...prev,
              title: prev.title || file.name.replace(/\.pdf$/i, ""),
              targetRole: prev.targetRole || res.data.personal_information?.title || "Full Stack Developer",
              resumeText: res.rawText || "",
              skills: extractedSkills.slice(0, 8).join(", "),
              fileName: file.name,
              fileBase64: base64,
            }));
            success(`Parsed ${file.name} with PyMuPDF!`);
          }
        } catch (err) {
          showError(err.message || "Failed to parse document");
        } finally {
          setIsUploadingVersionPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingVersionPdf(false);
      showError(err.message || "Upload failed");
    }
  };

  const handleSetDefaultResume = async (id) => {
    try {
      await api.setDefaultResume(id);
      success("Default resume updated!");
      loadResumes();
    } catch (err) {
      showError(err.message || "Failed to set default");
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await api.deleteResume(id);
      success("Resume version removed.");
      loadResumes();
    } catch (err) {
      showError(err.message || "Failed to delete resume");
    }
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!newResumeForm.title || (!newResumeForm.resumeText && !newResumeForm.fileBase64)) {
      showError("Title and either a PDF upload or resume content are required.");
      return;
    }
    try {
      await api.addResume({
        title: newResumeForm.title,
        targetRole: newResumeForm.targetRole,
        resumeText: newResumeForm.resumeText,
        skills: newResumeForm.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        fileName: newResumeForm.fileName || `${newResumeForm.title}.pdf`,
        fileBase64: newResumeForm.fileBase64,
        isDefault: newResumeForm.isDefault,
      });
      success("Tailored resume version saved!");
      setShowAddResumeModal(false);
      setNewResumeForm({ title: "", targetRole: "", resumeText: "", skills: "", fileName: "", fileBase64: "", isDefault: false });
      loadResumes();
    } catch (err) {
      showError(err.message || "Failed to create resume version");
    }
  };

  const [saving, setSaving] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const clean = newSkillInput.trim().toLowerCase();
    if (!skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      { title: "", company: "", duration: "", description: "" },
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      { degree: "", field: "", school: "", year: "" },
    ]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        targetRole: targetRole.trim(),
        preferredWorkType,
        experienceYears: Number(experienceYears) || 0,
        skills,
        resumeText,
        resumeFileName,
        experience: experiences,
        education: educations,
      });

      await refreshProfile();
      success("Profile details updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError("Please enter your current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showError(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const completionScore = user?.profileCompletion ?? 75;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hidden File Picker for Master Resume */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handlePdfUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile & Career Preferences</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal credentials, target roles, technical skills, and master ATS resume.
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="card-white p-3 flex items-center gap-3 self-start sm:self-auto shadow-xs">
          <div className="h-9 w-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs">
            {completionScore}%
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Profile Readiness</p>
            <p className="text-[10px] text-slate-400">Higher score boosts AI fit match</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab("general")}
          className={`py-1.5 px-3.5 rounded-md transition-all ${
            activeTab === "general" ? "bg-brand-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          General & Career
        </button>
        <button
          onClick={() => setActiveTab("experience")}
          className={`py-1.5 px-3.5 rounded-md transition-all ${
            activeTab === "experience" ? "bg-brand-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Experience & Education
        </button>
        <button
          onClick={() => setActiveTab("resumes")}
          className={`py-1.5 px-3.5 rounded-md transition-all ${
            activeTab === "resumes" ? "bg-brand-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Resume Versions ({resumesList.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`py-1.5 px-3.5 rounded-md transition-all ${
            activeTab === "security" ? "bg-brand-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Tab 1: General & Career Preferences */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Identity Section */}
          <div className="card-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserCircle size={16} className="text-brand-700" />
              Basic Candidate Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Engineer | Python, React, Cloud Architecture"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
              <textarea
                rows={3}
                placeholder="Brief summary of your professional expertise, leadership, and engineering achievements..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Target Role & Career Preferences */}
          <div className="card-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Compass size={16} className="text-brand-700" />
              Career Preferences & Target Role
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Work Arrangement</label>
                <select
                  value={preferredWorkType}
                  onChange={(e) => setPreferredWorkType(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  {WORK_TYPES.map((wt) => (
                    <option key={wt} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Total Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Master Resume PDF Ingestion & Management */}
          <div className="card-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-brand-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Master Resume (PDF & ATS Analysis)</h3>
                  <p className="text-[11px] text-slate-500">
                    Upload your official PDF resume. PyMuPDF extracts keywords and LLMs tailor bullets with Google XYZ formula.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openTailorModal("master", resumeFileName || "Master Resume", targetRole)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Sparkles size={13} />
                  Tailor with LLM
                </button>
              </div>
            </div>

            {/* Uploaded PDF Card or Dropzone */}
            {hasPdf || resumeFileName ? (
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{resumeFileName || "Master_Resume.pdf"}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={10} /> PyMuPDF Parsed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ATS Quality Score: <strong className="text-brand-700">{pdfAtsScore}%</strong> • Single-Column ATS Format
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadMasterPdf}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
                  >
                    {isDownloadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Download ATS PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
                  >
                    {isUploadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Replace PDF
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/40 hover:bg-slate-50 flex flex-col items-center justify-center group"
              >
                <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {isUploadingPdf ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploadingPdf ? "Parsing Resume PDF with PyMuPDF..." : "Upload Master Resume PDF"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  Drag and drop your PDF resume here, or click to browse. Automatically extracts skills, experience, and contact details.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span>Supports .pdf</span>
                  <span>•</span>
                  <span>PyMuPDF Parsing</span>
                  <span>•</span>
                  <span>100% ATS Ready</span>
                </div>
              </div>
            )}

            {/* Accordion to View/Edit Extracted Text */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewExtractedText(!viewExtractedText)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Eye size={13} className="text-slate-500" />
                  View / Edit Extracted Resume Text Context ({resumeText ? `${resumeText.length} chars` : "Empty"})
                </span>
                {viewExtractedText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {viewExtractedText && (
                <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                  <p className="text-[11px] text-slate-500">
                    This text is used by the AI to compute role alignment, draft cover letters, and generate interview questions.
                  </p>
                  <textarea
                    rows={6}
                    placeholder="Extracted resume text appears here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Skills Management Section */}
          <div className="card-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award size={16} className="text-brand-700" />
              Technical Skills & Proficiencies
            </h3>

            {/* Current Skills Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills listed yet. Upload a PDF or add skills below.</span>
              ) : (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill (e.g. PyTorch, React, Kubernetes) and press Enter..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 rounded-md border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Plus size={13} />
                Add Skill
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-5"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Experience & Education */}
      {activeTab === "experience" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Work Experience */}
          <div className="card-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900">Work Experience History</h3>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                <Plus size={12} /> Add Experience
              </button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">Role #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title (e.g. Senior Software Engineer)"
                      value={exp.title || ""}
                      onChange={(e) => handleUpdateExperience(idx, "title", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Company Name (e.g. Google)"
                      value={exp.company || ""}
                      onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 2021 - Present)"
                      value={exp.duration || ""}
                      onChange={(e) => handleUpdateExperience(idx, "duration", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Describe your responsibilities, technologies used, and quantified achievements..."
                    value={exp.description || ""}
                    onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900">Education Credentials</h3>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                <Plus size={12} /> Add Education
              </button>
            </div>

            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">Degree #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.S., M.S.)"
                      value={edu.degree || ""}
                      onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Computer Science)"
                      value={edu.field || ""}
                      onChange={(e) => handleUpdateEducation(idx, "field", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="School / University"
                      value={edu.school || ""}
                      onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year (e.g. 2022)"
                      value={edu.year || ""}
                      onChange={(e) => handleUpdateEducation(idx, "year", e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-5"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Experience & Education
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Resume Versions */}
      {activeTab === "resumes" && (
        <div className="space-y-4">
          <div className="card-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tailored Resume Versions</h3>
                <p className="text-xs text-slate-500">
                  Manage role-specific resume variations. Each version can be tailored with LLMs and downloaded as an ATS PDF.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResumeModal(true)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Plus size={13} />
                  Add Resume Version
                </button>
              </div>
            </div>

            {loadingResumes ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin mx-auto text-brand-600 mb-2" />
                <p className="text-xs text-slate-500">Loading your resume versions...</p>
              </div>
            ) : resumesList.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Resume Versions Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload a PDF above or click "Add Resume Version" to create tailored versions for different job applications.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumesList.map((res) => (
                  <div
                    key={res._id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      res.isDefault
                        ? "border-brand-500 bg-brand-50/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                          <span className="text-[11px] text-brand-700 font-medium">
                            {res.targetRole || "General Target"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {res.tailoredWithAI && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                              <Sparkles size={9} /> AI Tailored
                            </span>
                          )}

                          {res.isDefault ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={10} /> Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultResume(res._id)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-brand-700 px-2 py-0.5 rounded border border-slate-200 hover:border-brand-300"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </div>

                      {/* File Badge & ATS Score */}
                      <div className="flex items-center gap-2 mb-2 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {res.fileName || "resume.pdf"}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">
                          ATS Score: <span className="text-brand-700">{res.atsScore || 75}%</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded font-mono mb-3">
                        {res.resumeText}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadVersionPdf(res._id, res.fileName)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Download ATS PDF"
                        >
                          <Download size={11} /> PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => openTailorModal(res._id, res.title, res.targetRole)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                          title="Tailor with LLM"
                        >
                          <Sparkles size={11} /> Tailor LLM
                        </button>
                      </div>

                      {!res.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResume(res._id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Delete version"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal to Add Resume Version */}
          {showAddResumeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">Add Tailored Resume Version</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddResumeModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* PDF Ingestion Dropzone inside Modal */}
                <input
                  ref={versionFileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleVersionPdfUpload}
                  className="hidden"
                />

                <div
                  onClick={() => versionFileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg p-4 text-center cursor-pointer bg-indigo-50/20 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-3"
                >
                  {isUploadingVersionPdf ? (
                    <Loader2 size={18} className="animate-spin text-brand-600" />
                  ) : (
                    <Upload size={18} className="text-brand-600" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">
                      {isUploadingVersionPdf ? "Parsing PDF with PyMuPDF..." : "Upload Resume PDF to Auto-Fill"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Select a .pdf file to extract title, skills, and highlights automatically.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateResume} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Resume Version Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior AI Engineer Resume"
                      value={newResumeForm.title}
                      onChange={(e) => setNewResumeForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Role</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Engineer / LLM Specialist"
                      value={newResumeForm.targetRole}
                      onChange={(e) => setNewResumeForm((prev) => ({ ...prev, targetRole: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Key Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, PyTorch, LangChain, FastAPI, Docker"
                      value={newResumeForm.skills}
                      onChange={(e) => setNewResumeForm((prev) => ({ ...prev, skills: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Resume Content / Highlights *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Paste bullet points, accomplishments, and tech stack for this role..."
                      value={newResumeForm.resumeText}
                      onChange={(e) => setNewResumeForm((prev) => ({ ...prev, resumeText: e.target.value }))}
                      className="w-full border border-slate-200 rounded p-2 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={newResumeForm.isDefault}
                      onChange={(e) => setNewResumeForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-600 h-4 w-4"
                    />
                    <label htmlFor="isDefaultCheckbox" className="font-semibold text-slate-700">
                      Set as primary default resume
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddResumeModal(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary text-xs">
                      Save Version
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* LLM Tailoring Modal */}
          {tailorModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Tailor Resume with LLM</h4>
                      <p className="text-[11px] text-slate-500">
                        Source: <span className="font-semibold text-slate-700">{tailorModal.resumeTitle}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTailorModal((prev) => ({ ...prev, isOpen: false }))}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                {!tailorResult ? (
                  <form onSubmit={handleExecuteTailor} className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Target Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior AI Engineer"
                        value={tailorRole}
                        onChange={(e) => setTailorRole(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs font-medium"
                      />

                      {/* Quick Role Suggestions */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ROLE_SUGGESTIONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setTailorRole(r)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              tailorRole === r
                                ? "bg-purple-100 border-purple-300 text-purple-800"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Target Job Description (Optional)</label>
                      <textarea
                        rows={4}
                        placeholder="Paste target job requirements to prioritize exact keywords and technical challenges..."
                        value={tailorJobDescription}
                        onChange={(e) => setTailorJobDescription(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Key Focus Skills (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Python, PyTorch, LangChain, RAG, FastAPI, Docker"
                        value={tailorSkills}
                        onChange={(e) => setTailorSkills(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="saveAsNewVer"
                        checked={saveAsNewVersion}
                        onChange={(e) => setSaveAsNewVersion(e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 h-4 w-4"
                      />
                      <label htmlFor="saveAsNewVer" className="font-semibold text-slate-700">
                        Save as a new tailored version (keeps original intact)
                      </label>
                    </div>

                    <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-[11px] text-purple-900 flex items-start gap-2">
                      <Shield size={14} className="text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Zero-Hallucination Guardrail Active:</strong> LLM rewrites bullets strictly via Google XYZ formula without inventing metrics, percentages, or non-existent claims.
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setTailorModal((prev) => ({ ...prev, isOpen: false }))}
                        className="btn-secondary text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isTailoring}
                        className="btn-primary text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700"
                      >
                        {isTailoring ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Optimizing with LLM...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            Tailor Resume with LLM
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-xs">Resume Tailored Successfully!</p>
                          <p className="text-[11px] text-emerald-700">
                            Updated ATS Compatibility Score: <strong>{tailorResult.atsScore}%</strong>
                          </p>
                        </div>
                      </div>

                      {tailorResult.pdfBase64 && (
                        <button
                          type="button"
                          onClick={() => {
                            const byteChars = atob(tailorResult.pdfBase64);
                            const byteNumbers = new Array(byteChars.length);
                            for (let i = 0; i < byteChars.length; i++) {
                              byteNumbers[i] = byteChars.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: "application/pdf" });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", tailorResult.fileName || "Tailored_Resume.pdf");
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-xs hover:bg-emerald-800 transition-all"
                        >
                          <Download size={13} /> Download Tailored PDF
                        </button>
                      )}
                    </div>

                    {/* Bullet Improvements Diff Preview */}
                    {tailorResult.report?.diffs && tailorResult.report.diffs.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-xs">
                          Google XYZ Bullet Enhancements ({tailorResult.report.diffs.length}):
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {tailorResult.report.diffs.map((diff, dIdx) => (
                            <div key={dIdx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Original:
                              </div>
                              <p className="text-[11px] text-slate-600 line-through">{diff.original_text}</p>
                              <div className="text-[10px] text-purple-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={10} /> Google XYZ Tailored:
                              </div>
                              <p className="text-[11px] font-semibold text-slate-900 bg-purple-50/50 p-1.5 rounded border border-purple-100">
                                {diff.improved_text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setTailorModal((prev) => ({ ...prev, isOpen: false }))}
                        className="btn-primary text-xs"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="card-white p-6 space-y-4 max-w-md">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock size={16} className="text-brand-700" />
            <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary text-xs py-2 px-4"
            >
              {changingPassword ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
