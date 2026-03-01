import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import type { ResumeSuggestion } from "../types";

export default function ResumeOptimizerPage() {
  const [role, setRole] = useState("Backend Developer");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ResumeSuggestion | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const output = await api.optimizeResume({ role, resumeText });
    setResult(output);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-white/10 bg-[#0a1730] p-4"
      >
        <h1 className="text-xl font-semibold">AI Resume Optimizer</h1>
        <input
          className="mt-3 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <textarea
          className="mt-3 h-64 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2"
          placeholder="Paste resume text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <button className="mt-3 rounded-lg bg-teal-400 px-4 py-2 font-semibold text-slate-900">
          Optimize Resume
        </button>
      </form>

      <article className="rounded-xl border border-white/10 bg-[#0a1730] p-4">
        <h2 className="text-lg font-semibold">ATS Suggestions</h2>
        {!result ? (
          <p className="mt-2 text-slate-300">
            Run optimizer to get suggestions.
          </p>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-200">Missing Keywords</p>
              <p className="text-slate-300">
                {result.missingKeywords.join(", ") || "None"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-200">Bullet Improvements</p>
              <ul className="list-disc pl-5 text-slate-300">
                {result.bulletSuggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-200">Checklist</p>
              <p className="text-slate-300">
                Contact: {String(result.atsChecklist.hasContactSection)} |
                Projects: {String(result.atsChecklist.hasProjectsSection)} |
                Metrics: {String(result.atsChecklist.hasImpactMetrics)}
              </p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
