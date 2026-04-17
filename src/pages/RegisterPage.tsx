import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 bg-white dark:bg-slate-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <Zap size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CareerOS AI</span>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <div>
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                    Full name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-brand-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-rose-50 p-4 dark:bg-rose-500/10">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-rose-800 dark:text-rose-400">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Create account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-24 xl:px-32 z-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
              Accelerate your engineering career.
            </h2>
             <p className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-12 max-w-xl">
              AI-driven insights to match you with the best roles, highlight skill gaps, and optimize your interview performance.
            </p>
            <div className="grid grid-cols-2 gap-8">
               <div className="border-l-4 border-emerald-500 pl-4">
                 <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Live Market Data</p>
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Continuous sync with top job boards to keep your targets relevant and actionable.</p>
               </div>
               <div className="border-l-4 border-brand-500 pl-4">
                 <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">AI Optimization</p>
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Tailor your resume against ATS parsers and generate mock interviews in seconds.</p>
               </div>
            </div>
        </div>
         <svg
            className="absolute inset-0 h-full w-full stroke-slate-200 dark:stroke-slate-800 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="pattern-id"
                width={200}
                height={200}
                x="100%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M130 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#pattern-id)" />
          </svg>
      </div>
    </div>
  );
}
