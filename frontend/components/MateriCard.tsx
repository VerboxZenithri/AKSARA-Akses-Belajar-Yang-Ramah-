"use client";

import Link from "next/link";
import { MateriWithStatus } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  belum: "Belum dimulai",
  proses: "Sedang berjalan",
  selesai: "Selesai",
};

const STATUS_DOT: Record<string, string> = {
  belum: "bg-status-belum",
  proses: "bg-status-proses",
  selesai: "bg-status-selesai",
};

export default function MateriCard({ materi }: { materi: MateriWithStatus }) {
  return (
    <Link
      href={`/dashboard/siswa/materi/${materi.id}`}
      className="block rounded-2xl border border-line bg-white p-5 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[materi.status]}`} />
        <span className="text-xs font-medium text-ink/50">
          {STATUS_LABEL[materi.status]}
        </span>
      </div>
      <h3 className="font-display font-bold text-lg text-ink leading-snug">
        {materi.judul}
      </h3>
      <p className="mt-2 text-sm text-ink/60 line-clamp-2">{materi.pengertian}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-ink/40">
        {materi.video_url && <span>▶ Video</span>}
        {materi.audio_url && <span>♪ Audio</span>}
        <span>{materi.step_by_step.length} langkah</span>
      </div>
    </Link>
  );
}
