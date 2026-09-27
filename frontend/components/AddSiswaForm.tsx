"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";

export default function AddSiswaForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    kelas: "",
    angkatan: new Date().getFullYear(),
    is_abk: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api("/api/guru/siswa", { method: "POST", body: form });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah murid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nama Lengkap">
        <input
          required
          value={form.nama_lengkap}
          onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Username">
        <input
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Password">
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Kelas">
          <input
            required
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className="input"
            placeholder="mis. XI RPL 1"
          />
        </Field>
        <Field label="Angkatan">
          <input
            required
            type="number"
            value={form.angkatan}
            onChange={(e) => setForm({ ...form, angkatan: Number(e.target.value) })}
            className="input"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={form.is_abk}
          onChange={(e) => setForm({ ...form, is_abk: e.target.checked })}
          className="rounded border-line"
        />
        Siswa berkebutuhan khusus (ABK)
      </label>

      {error && <p className="text-sm text-status-belum">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 disabled:opacity-60"
      >
        {submitting ? "Menyimpan..." : "Tambah Murid"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/70 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
