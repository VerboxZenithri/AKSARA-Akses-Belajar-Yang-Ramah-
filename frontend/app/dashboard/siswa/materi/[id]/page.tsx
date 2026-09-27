"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/DashboardHeader";
import { api } from "@/lib/api";
import { MateriWithStatus } from "@/lib/types";

function MateriDetail() {
  const params = useParams();
  const router = useRouter();
  const materiId = params.id as string;

  const [materi, setMateri] = useState<MateriWithStatus | null>(null);
  const [selesaiSteps, setSelesaiSteps] = useState<Set<number>>(new Set());
  const [savingTugas, setSavingTugas] = useState(false);

  const muat = useCallback(async () => {
    const data = await api<MateriWithStatus>(`/api/siswa/materi/${materiId}`);
    setMateri(data);
    // Materi baru dibuka -> tandai "proses" jika masih "belum"
    if (data.status === "belum") {
      await api(`/api/siswa/materi/${materiId}/progress`, {
        method: "POST",
        body: { status: "proses" },
      });
    }
  }, [materiId]);

  useEffect(() => {
    muat();
  }, [muat]);

  function toggleStep(idx: number) {
    setSelesaiSteps((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  async function tandaiTugasSelesai() {
    setSavingTugas(true);
    try {
      await api(`/api/siswa/materi/${materiId}/progress`, {
        method: "POST",
        body: { status: "selesai" },
      });
      setMateri((m) => (m ? { ...m, status: "selesai" } : m));
    } finally {
      setSavingTugas(false);
    }
  }

  if (!materi) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">
        Memuat materi...
      </div>
    );
  }

  const semuaStepSelesai =
    materi.step_by_step.length > 0 && selesaiSteps.size === materi.step_by_step.length;

  return (
    <div className="min-h-screen">
      <DashboardHeader eyebrow="Materi Pelajaran" />

      <main className="px-6 py-8 lg:px-10 max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/dashboard/siswa")}
          className="text-sm text-primary hover:underline mb-6"
        >
          ← Kembali ke daftar materi
        </button>

        <h1 className="font-display text-3xl font-bold text-ink mb-2">{materi.judul}</h1>
        <p className="text-ink/50 text-sm mb-8">Untuk angkatan {materi.untuk_angkatan}</p>

        {/* Video + Audio */}
        {(materi.video_url || materi.audio_url) && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-lg mb-3">Video &amp; Audio</h2>
            {materi.video_url && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                controls
                src={materi.video_url}
                className="w-full rounded-2xl border border-line bg-black mb-3"
              />
            )}
            {materi.audio_url && (
              <audio controls src={materi.audio_url} className="w-full" />
            )}
          </section>
        )}

        {/* Teks Materi */}
        <section className="mb-8 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display font-bold text-lg mb-3">Teks Materi</h2>
          <p className="text-ink/70 leading-relaxed whitespace-pre-line">
            {materi.pengertian}
          </p>
        </section>

        {/* Step by Step */}
        {materi.step_by_step.length > 0 && (
          <section className="mb-8 rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display font-bold text-lg mb-4">Panduan Step by Step</h2>
            <ol className="space-y-3">
              {materi.step_by_step.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(idx)}
                    aria-pressed={selesaiSteps.has(idx)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                      selesaiSteps.has(idx)
                        ? "bg-status-selesai border-status-selesai text-white"
                        : "border-line text-ink/40"
                    }`}
                  >
                    {selesaiSteps.has(idx) ? "✓" : idx + 1}
                  </button>
                  <p
                    className={`text-sm leading-relaxed ${
                      selesaiSteps.has(idx) ? "text-ink/40 line-through" : "text-ink/80"
                    }`}
                  >
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Tugas */}
        {materi.tugas_deskripsi && (
          <section className="rounded-2xl border border-line bg-accent-soft/40 p-6">
            <h2 className="font-display font-bold text-lg mb-2">Tugas</h2>
            <p className="text-ink/70 leading-relaxed mb-4">{materi.tugas_deskripsi}</p>

            {materi.status === "selesai" ? (
              <p className="text-status-selesai font-semibold text-sm">
                ✓ Tugas ini sudah kamu selesaikan
              </p>
            ) : (
              <button
                onClick={tandaiTugasSelesai}
                disabled={!semuaStepSelesai || savingTugas}
                className="rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                {savingTugas ? "Menyimpan..." : "Tandai Tugas Selesai"}
              </button>
            )}
            {!semuaStepSelesai && materi.status !== "selesai" && (
              <p className="text-xs text-ink/40 mt-2">
                Selesaikan semua langkah step-by-step dulu untuk membuka tombol ini.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute role="siswa">
      <MateriDetail />
    </ProtectedRoute>
  );
}
