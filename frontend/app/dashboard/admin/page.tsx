"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/DashboardHeader";
import Modal from "@/components/Modal";
import AddGuruForm from "@/components/AddGuruForm";
import UserTable from "@/components/UserTable";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalGuru, setModalGuru] = useState(false);
  const [filter, setFilter] = useState<"semua" | "guru" | "siswa" | "abk">("semua");

  const muat = useCallback(async () => {
    const data = await api<User[]>("/api/admin/users");
    setUsers(data);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const filtered = users.filter((u) => {
    if (filter === "semua") return true;
    if (filter === "guru") return u.role === "guru";
    if (filter === "siswa") return u.role === "siswa";
    if (filter === "abk") return u.role === "siswa" && u.is_abk;
    return true;
  });

  return (
    <div className="min-h-screen">
      <DashboardHeader eyebrow="Dashboard Admin" />

      <main className="px-6 py-8 lg:px-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Database Pengguna</h2>
            <p className="text-sm text-ink/50">Kelola akun guru dan siswa (termasuk siswa ABK).</p>
          </div>
          <button
            onClick={() => setModalGuru(true)}
            className="rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 text-sm"
          >
            + Buat Akun Guru
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {(["semua", "guru", "siswa", "abk"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "border-line text-ink/60 hover:border-primary"
              }`}
            >
              {f === "semua" ? "Semua" : f === "abk" ? "Siswa ABK" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <UserTable users={filtered} onChanged={muat} />
      </main>

      {modalGuru && (
        <Modal title="Buat Akun Guru" onClose={() => setModalGuru(false)}>
          <AddGuruForm
            onSuccess={() => {
              setModalGuru(false);
              muat();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
