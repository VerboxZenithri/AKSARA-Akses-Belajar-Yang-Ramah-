"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/DashboardHeader";
import MateriCard from "@/components/MateriCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/useWebSocket";
import { MateriWithStatus } from "@/lib/types";

function SiswaDashboard() {
  const { token } = useAuth();
  const [materiList, setMateriList] = useState<MateriWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage, connected } = useWebSocket(token);

  const muat = useCallback(async () => {
    const data = await api<MateriWithStatus[]>("/api/siswa/materi");
    setMateriList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  // [DASHBOARD] siswa: materi baru dari guru langsung muncul (WebSocket Sync)
  useEffect(() => {
    if (lastMessage?.type === "materi_baru") {
      muat();
    }
  }, [lastMessage, muat]);

  const belum = materiList.filter((m) => m.status === "belum").length;
  const proses = materiList.filter((m) => m.status === "proses").length;
  const selesai = materiList.filter((m) => m.status === "selesai").length;

  return (
    <div className="min-h-screen">
      <DashboardHeader eyebrow="Dashboard Siswa" connected={connected} />

      <main className="px-6 py-8 lg:px-10 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-8">
          <Ringkasan label="Belum dimulai" jumlah={belum} warna="bg-status-belum" />
          <Ringkasan label="Sedang berjalan" jumlah={proses} warna="bg-status-proses" />
          <Ringkasan label="Selesai" jumlah={selesai} warna="bg-status-selesai" />
        </div>

        <h2 className="font-display text-2xl font-bold mb-5">Mata Pelajaran Kamu</h2>

        {loading ? (
          <p className="text-ink/50 text-sm">Memuat materi...</p>
        ) : materiList.length === 0 ? (
          <p className="text-ink/50 text-sm">
            Belum ada materi untuk angkatanmu. Materi baru akan langsung muncul di sini.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiList.map((m) => (
              <MateriCard key={m.id} materi={m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Ringkasan({ label, jumlah, warna }: { label: string; jumlah: number; warna: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <span className={`h-8 w-8 rounded-full ${warna} text-white flex items-center justify-center text-sm font-bold`}>
        {jumlah}
      </span>
      <span className="text-sm text-ink/60">{label}</span>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute role="siswa">
      <SiswaDashboard />
    </ProtectedRoute>
  );
}
