"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";

export default function AddGuruForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ nama_lengkap: "", username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api("/api/admin/guru", { method: "POST", body: form });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun guru");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Nama Lengkap</label>
        <input
          required
          value={form.nama_lengkap}
          onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Username</label>
        <input
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
        />
      </div>

      {error && <p className="text-sm text-status-belum">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 disabled:opacity-60"
      >
        {submitting ? "Menyimpan..." : "Buat Akun Guru"}
      </button>
    </form>
  );
}
