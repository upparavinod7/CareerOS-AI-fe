import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";

export default function InterviewPrepPage() {
  const [role, setRole] = useState("Backend Developer");
  const [focusSkills, setFocusSkills] = useState("system_design,node,docker");
  const [result, setResult] = useState<{ technical: string[]; behavioral: string[]; mockPlan: string[] } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const output = await api.interviewGuidance({
      role,
      focusSkills: focusSkills.split(",").map((x) => x.trim()).filter(Boolean),
    });
    setResult(output);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
        <h1 className="text-xl font-semibold">Interview Preparation Guidance</h1>
        <input className="mt-3 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)} />
        <input className="mt-3 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={focusSkills} onChange={(e) => setFocusSkills(e.target.value)} />
        <button className="mt-3 rounded-lg bg-teal-400 px-4 py-2 font-semibold text-slate-900">Generate Prep Plan</button>
      </form>

      <article className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
        {!result ? <p className="text-slate-300">Generate guidance for technical + behavioral rounds.</p> : (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Technical</p>
              <ul className="list-disc pl-5 text-slate-300">{result.technical.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <p className="font-semibold">Behavioral</p>
              <ul className="list-disc pl-5 text-slate-300">{result.behavioral.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <p className="font-semibold">3-Day Mock Plan</p>
              <ul className="list-disc pl-5 text-slate-300">{result.mockPlan.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}



