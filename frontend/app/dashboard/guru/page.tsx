"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/DashboardHeader";
import Modal from "@/components/Modal";
import AddSiswaForm from "@/components/AddSiswaForm";
import AddMateriForm from "@/components/AddMateriForm";
import ProgresTable from "@/components/ProgresTable";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/useWebSocket";
import { ProgressBaris } from "@/lib/types";

function GuruDashboard() {
  const { token } = useAuth();
  const [progresData, setProgresData] = useState<ProgressBaris[]>([]);
  const [modalMateri, setModalMateri] = useState(false);
  const [modalSiswa, setModalSiswa] = useState(false);
  const { lastMessage, connected } = useWebSocket(token);

  const muatProgres = useCallback(async () => {
    const data = await api<ProgressBaris[]>("/api/guru/progres");
    setProgresData(data);
  }, []);

  useEffect(() => {
    muatProgres();
  }, [muatProgres]);

  // Sinkronisasi real-time: warna progres siswa berubah tanpa reload
  useEffect(() => {
    if (lastMessage?.type === "progress_update") {
      muatProgres();
    }
  }, [lastMessage, muatProgres]);

  return (
    <div className="min-h-screen pb-24">
      <DashboardHeader eyebrow="Dashboard Guru" connected={connected} />

      <main className="px-6 py-8 lg:px-10 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold mb-1">Pantau Progres Murid</h2>
        <p className="text-sm text-ink/50 mb-6">
          Klik nama murid untuk melihat progres tiap materi.
        </p>
        <ProgresTable data={progresData} />
      </main>

      {/* Tombol pojok kiri bawah: menambah materi */}
      <button
        onClick={() => setModalMateri(true)}
        className="fixed bottom-6 left-6 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 shadow-lg text-sm"
      >
        + Materi
      </button>

      {/* Tombol pojok kanan bawah: nambah murid */}
      <button
        onClick={() => setModalSiswa(true)}
        className="fixed bottom-6 right-6 rounded-full bg-accent hover:brightness-95 text-ink font-semibold px-5 py-3 shadow-lg text-sm"
      >
        + Murid
      </button>

      {modalMateri && (
        <Modal title="Input Materi" onClose={() => setModalMateri(false)}>
          <AddMateriForm
            onSuccess={() => {
              setModalMateri(false);
              muatProgres();
            }}
          />
        </Modal>
      )}

      {modalSiswa && (
        <Modal title="Tambah Murid" onClose={() => setModalSiswa(false)}>
          <AddSiswaForm
            onSuccess={() => {
              setModalSiswa(false);
              muatProgres();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute role="guru">
      <GuruDashboard />
    </ProtectedRoute>
  );
}
