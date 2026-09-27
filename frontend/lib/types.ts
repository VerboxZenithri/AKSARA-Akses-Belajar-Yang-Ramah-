export type Role = "admin" | "guru" | "siswa";
export type StatusMateri = "belum" | "proses" | "selesai";

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  role: Role;
  kelas?: string | null;
  angkatan?: number | null;
  is_abk: boolean;
}

export interface Materi {
  id: number;
  judul: string;
  pengertian: string;
  step_by_step: string[];
  video_url?: string | null;
  audio_url?: string | null;
  tugas_deskripsi?: string | null;
  untuk_angkatan: number;
  created_at: string;
}

export interface MateriWithStatus extends Materi {
  status: StatusMateri;
}

export interface ProgressBaris {
  siswa: User;
  materi_id: number;
  materi_judul: string;
  status: StatusMateri;
}
