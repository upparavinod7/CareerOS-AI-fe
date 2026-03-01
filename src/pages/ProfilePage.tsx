import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [skills, setSkills] = useState((user?.skills || []).join(","));
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears ?? 0);
  const [targetRole, setTargetRole] = useState(user?.targetRole ?? "");
  const [resumeText, setResumeText] = useState(user?.resumeText ?? "");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.updateProfile({
      name,
      skills: skills.split(",").map((x) => x.trim()).filter(Boolean),
      experienceYears,
      targetRole,
      resumeText,
    });
    await refreshProfile();
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
      <h1 className="text-xl font-semibold">User Profile</h1>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border border-white/15 bg-[#081224] px-3 py-2" />
        <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target Role" className="rounded-lg border border-white/15 bg-[#081224] px-3 py-2" />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills comma separated" className="rounded-lg border border-white/15 bg-[#081224] px-3 py-2 md:col-span-2" />
        <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} placeholder="Experience years" className="rounded-lg border border-white/15 bg-[#081224] px-3 py-2" />
      </div>
      <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Resume text" className="mt-3 h-52 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" />
      <button className="mt-3 rounded-lg bg-teal-400 px-4 py-2 font-semibold text-slate-900">Save Profile</button>
    </form>
  );
}



