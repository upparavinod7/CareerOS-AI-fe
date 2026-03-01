import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050912] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1b33] p-6">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-300">Sign in to CareerOS AI</p>

        <label className="mt-5 block text-sm text-slate-300">Email</label>
        <input autoComplete="email" className="mt-1 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="mt-4 block text-sm text-slate-300">Password</label>
        <input type="password" autoComplete="current-password" className="mt-1 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button disabled={loading} className="mt-5 w-full rounded-lg bg-teal-400 px-4 py-2 font-semibold text-slate-900">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          New user? <Link className="text-teal-300" to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}





