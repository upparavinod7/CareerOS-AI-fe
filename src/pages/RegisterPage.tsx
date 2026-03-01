import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    <div className="flex min-h-screen items-center justify-center bg-[#050912] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1b33] p-6">
        <h1 className="text-2xl font-bold text-white">Create account</h1>

        <label className="mt-5 block text-sm text-slate-300">Name</label>
        <input autoComplete="name" className="mt-1 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="mt-4 block text-sm text-slate-300">Email</label>
        <input autoComplete="email" className="mt-1 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="mt-4 block text-sm text-slate-300">Password</label>
        <input type="password" autoComplete="new-password" className="mt-1 w-full rounded-lg border border-white/15 bg-[#081224] px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button disabled={loading} className="mt-5 w-full rounded-lg bg-teal-400 px-4 py-2 font-semibold text-slate-900 disabled:opacity-60">
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          Already have account? <Link className="text-teal-300" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}





