import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { UserCircle, Save, FileText, Pickaxe, Clock, Target, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [skills, setSkills] = useState((user?.skills || []).join(", "));
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears ?? 0);
  const [targetRole, setTargetRole] = useState(user?.targetRole ?? "");
  const [resumeText, setResumeText] = useState(user?.resumeText ?? "");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name,
        skills: skills.split(",").map((x) => x.trim()).filter(Boolean),
        experienceYears,
        targetRole,
        resumeText,
      });
      await refreshProfile();
      showSuccess("Profile saved successfully!");
    } catch (err) {
      showError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <UserCircle size={20} />
          </span>
          User Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal information, career goals, and master resume context.
        </p>
      </div>

      <form onSubmit={onSubmit} className="saas-card p-6 md:p-8">
        <div className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
            <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              Personal Info
            </h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
               Basic details about yourself.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 flex items-center gap-1.5"><UserCircle size={14} className="text-slate-400"/> Full Name</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                    placeholder="e.g. Alex Doe"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
            <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              Career Parameters
            </h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
               Used for initial fit scores and roadmap generation.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 flex items-center gap-1.5"><Target size={14} className="text-slate-400"/> Primary Target Role</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> Experience (Years)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-400"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 flex items-center gap-1.5"><Pickaxe size={14} className="text-slate-400"/> Skills Database</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                    placeholder="e.g. React, TypeScript, Node.js"
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Comma separated format.</p>
              </div>
            </div>
          </div>

          <div>
             <h2 className="text-base font-semibold leading-7 text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              Resume Context
            </h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
               Used by the analyzer and optimizer for tailoring.
            </p>
            
            <div className="mt-6 col-span-full">
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 flex items-center gap-1.5"><FileText size={14} className="text-slate-400"/> Master Resume Text</label>
              <div className="mt-2">
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-brand-400"
                  placeholder="Paste your full resume text here..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-slate-200 dark:border-slate-800 pt-8">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
