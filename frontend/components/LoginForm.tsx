"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-4xl font-extrabold text-primary-dark tracking-tight">
        AKSARA
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Akses Belajar yang Ramah — masuk untuk melanjutkan.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-ink/80 mb-1.5">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-primary focus:ring-0"
            placeholder="mis. budi.siswa"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-primary focus:ring-0"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-status-belum bg-status-belum/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary hover:bg-primary-dark transition-colors text-white font-semibold py-3 disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-xs text-ink/40">
        Akun demo — Admin: <span className="font-medium">admin / admin123</span>
      </p>
    </div>
  );
}
