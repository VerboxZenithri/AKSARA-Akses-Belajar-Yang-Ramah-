"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import Modal from "./Modal";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  siswa: "Siswa",
};

export default function UserTable({
  users,
  onChanged,
}: {
  users: User[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<User | null>(null);

  async function hapus(user: User) {
    if (!confirm(`Hapus akun ${user.nama_lengkap}?`)) return;
    await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <>
      <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Peran</th>
              <th className="px-4 py-3 font-medium">Kelas / Angkatan</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">{u.nama_lengkap}</td>
                <td className="px-4 py-3 text-ink/60">{u.username}</td>
                <td className="px-4 py-3 text-ink/60">{ROLE_LABEL[u.role]}</td>
                <td className="px-4 py-3 text-ink/60">
                  {u.kelas ? `${u.kelas} · ${u.angkatan}` : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  {u.role !== "admin" && (
                    <>
                      <button
                        onClick={() => setEditing(u)}
                        className="text-primary hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => hapus(u)}
                        className="text-status-belum hover:underline"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`Ubah akun ${editing.nama_lengkap}`} onClose={() => setEditing(null)}>
          <EditUserForm
            user={editing}
            onSuccess={() => {
              setEditing(null);
              onChanged();
            }}
          />
        </Modal>
      )}
    </>
  );
}

function EditUserForm({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const [namaLengkap, setNamaLengkap] = useState(user.nama_lengkap);
  const [kelas, setKelas] = useState(user.kelas || "");
  const [angkatan, setAngkatan] = useState(user.angkatan || new Date().getFullYear());
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { nama_lengkap: namaLengkap };
      if (user.role === "siswa") {
        body.kelas = kelas;
        body.angkatan = angkatan;
      }
      if (password) body.password = password;
      await api(`/api/admin/users/${user.id}`, { method: "PUT", body });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Nama Lengkap</label>
        <input value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} className="input" />
      </div>
      {user.role === "siswa" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Kelas</label>
            <input value={kelas} onChange={(e) => setKelas(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Angkatan</label>
            <input
              type="number"
              value={angkatan}
              onChange={(e) => setAngkatan(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">
          Password baru (kosongkan jika tidak berubah)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>
      {error && <p className="text-sm text-status-belum">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 disabled:opacity-60"
      >
        {submitting ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
