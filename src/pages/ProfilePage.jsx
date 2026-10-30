import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { WORK_TYPES } from "../types";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState("general"); // "general", "experience", "security"

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [preferredWorkType, setPreferredWorkType] = useState(user?.preferredWorkType || "Remote");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [resumeText, setResumeText] = useState(user?.resumeText || "");

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile & Career Preferences</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal credentials, target roles, technical skills, and master resume.
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
              Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Engineer | Distributed Systems & React"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Career Objective</label>
              <textarea
                rows={3}
                placeholder="Brief summary of your professional strengths, key domains, and aspirations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Career Targets & Preferences */}
          <div className="card-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Compass size={16} className="text-brand-700" />
              Career Targets & Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Type Preference</label>
                <select
                  value={preferredWorkType}
                  onChange={(e) => setPreferredWorkType(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  {["Remote", "Hybrid", "On-site", "Any"].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="35"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Skills Chip Manager */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Core Technical Skills ({skills.length})
              </label>

              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 min-h-[50px] items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge-indigo text-xs py-1 px-2.5 flex items-center gap-1.5"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type skill name and press Enter (e.g. react, docker, python)..."
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

            {/* Master Resume Text Context */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Master Resume Text Context
              </label>
              <textarea
                rows={6}
                placeholder="Paste your standard resume or key project highlights here to seed fit analyses and cover letters..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none font-mono leading-relaxed"
              />
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
                  Save Changes
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
                      value={exp.title}
                      onChange={(e) => handleUpdateExperience(idx, "title", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Company (e.g. Google)"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 2022 - Present)"
                      value={exp.duration}
                      onChange={(e) => handleUpdateExperience(idx, "duration", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Key achievements and technologies utilized..."
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                  />
                </div>
              ))}

              {experiences.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">
                  No work experience entries added yet. Click "+ Add Experience" to record your history.
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="card-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900">Education & Degrees</h3>
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
                    <span className="font-bold text-slate-700 text-xs">Education #{idx + 1}</span>
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
                      placeholder="Degree (e.g. B.Tech / B.S.)"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Field (e.g. Computer Science)"
                      value={edu.field}
                      onChange={(e) => handleUpdateEducation(idx, "field", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="University / School"
                      value={edu.school}
                      onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year (e.g. 2024)"
                      value={edu.year}
                      onChange={(e) => handleUpdateEducation(idx, "year", e.target.value)}
                      className="rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              ))}

              {educations.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">
                  No education entries recorded yet. Click "+ Add Education" to list degrees.
                </p>
              )}
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Security & Password */}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
              <input
                type="password"
                required
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              {changingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
