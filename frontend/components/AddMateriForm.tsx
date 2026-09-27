"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";

export default function AddMateriForm({ onSuccess }: { onSuccess: () => void }) {
  const [judul, setJudul] = useState("");
  const [pengertian, setPengertian] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [tugas, setTugas] = useState("");
  const [angkatan, setAngkatan] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateStep(idx: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? value : s)));
  }
  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }
  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api("/api/guru/materi", {
        method: "POST",
        body: {
          judul,
          pengertian,
          step_by_step: steps.map((s) => s.trim()).filter(Boolean),
          video_url: videoUrl || null,
          audio_url: audioUrl || null,
          tugas_deskripsi: tugas || null,
          untuk_angkatan: angkatan,
        },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah materi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Judul Materi</label>
        <input required value={judul} onChange={(e) => setJudul(e.target.value)} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Pengertian Materi</label>
        <textarea
          required
          rows={3}
          value={pengertian}
          onChange={(e) => setPengertian(e.target.value)}
          className="textarea"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Step by Step</label>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={step}
                onChange={(e) => updateStep(idx, e.target.value)}
                placeholder={`Langkah ${idx + 1}`}
                className="input"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="px-3 text-ink/40 hover:text-status-belum"
                  aria-label="Hapus langkah"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2 text-sm text-primary hover:underline"
        >
          + Tambah langkah
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Video (URL)</label>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Audio (URL)</label>
          <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} className="input" placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Deskripsi Tugas</label>
        <textarea rows={2} value={tugas} onChange={(e) => setTugas(e.target.value)} className="textarea" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Untuk Angkatan Berapa</label>
        <input
          required
          type="number"
          value={angkatan}
          onChange={(e) => setAngkatan(Number(e.target.value))}
          className="input"
        />
      </div>

      {error && <p className="text-sm text-status-belum">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 disabled:opacity-60"
      >
        {submitting ? "Menyimpan..." : "Submit"}
      </button>
    </form>
  );
}
