import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";

const interestOptions = [
  "AI & Machine Learning",
  "Generative AI & LLMs",
  "Autonomous Agents",
  "Full Stack Web Development",
  "High-Performance Backend",
  "Cloud Infrastructure & DevOps",
  "Data Science & Analytics",
];

export default function CareerPredictorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [skillsInput, setSkillsInput] = useState((user?.skills || []).join(", ") || "python, react, sql, node");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 2);
  const [education, setEducation] = useState("Bachelor's in Computer Science or related field");
  const [selectedInterests, setSelectedInterests] = useState(["AI & Machine Learning", "Full Stack Web Development"]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.predictCareer({
        skills,
        experienceYears: Number(experienceYears) || 0,
        education,
        interests: selectedInterests,
        targetAreas: selectedInterests,
      });

      setResults(res);
      success("Role predictions generated based on your profile!");
    } catch (err) {
      showError(err.message || "Prediction engine encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Career Role Predictor</h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover strategic high-growth career tracks aligned with your existing skills and interests.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] items-start">
        {/* Input Parameters Form */}
        <div className="card-white p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass size={18} className="text-brand-700" />
            <h2 className="text-sm font-bold text-slate-900">Career Profile Parameters</h2>
          </div>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Technical Skills (Comma-separated)
              </label>
              <textarea
                rows={3}
                required
                placeholder="python, pytorch, sql, react, docker, statistics..."
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Background</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Target Industries & Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {interestOptions.map((item) => {
                  const active = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        active
                          ? "bg-brand-700 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating Role Predictions...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Predict Recommended Roles
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results */}
        <div>
          {loading ? (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Evaluating Market Trajectories</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Computing skill overlap vectors against industry benchmarks...
              </p>
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                <Lightbulb size={16} className="text-brand-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{results.guidanceNote}</p>
              </div>

              {(results.topRecommendations || []).map((rec, idx) => (
                <motion.div
                  key={rec.role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="card-white p-5 space-y-3.5 border-l-4 border-l-brand-700 hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <h3 className="text-base font-bold text-slate-900">{rec.role}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.description}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {rec.suitabilityScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Suitability</span>
                    </div>
                  </div>

                  {/* Skills Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Transferable Skills You Have
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(rec.existingSkills || []).map((s) => (
                          <span key={s} className="badge-emerald text-[11px] py-0.5 px-2">
                            ✓ {s.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        High-Impact Gap Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(rec.missingSkills || []).map((s) => (
                          <span key={s} className="badge-amber text-[11px] py-0.5 px-2">
                            + {s.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-600 italic truncate max-w-sm">
                      {rec.recommendedLearningPath}
                    </p>
                    <button
                      onClick={() => navigate(`/roadmap?role=${encodeURIComponent(rec.role)}`)}
                      className="btn-primary text-xs py-1.5 px-3 shrink-0"
                    >
                      Generate Roadmap
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <TrendingUp size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Ready to Predict Your Next Role</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Fill in your current skills and career interests, then click "Predict Recommended Roles" to generate strategic career pathways.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
