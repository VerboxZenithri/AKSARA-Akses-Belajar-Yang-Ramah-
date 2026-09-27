"use client";

import { useMemo, useState } from "react";
import { ProgressBaris } from "@/lib/types";

const STATUS_DOT: Record<string, string> = {
  belum: "bg-status-belum",
  proses: "bg-status-proses",
  selesai: "bg-status-selesai",
};

const STATUS_LABEL: Record<string, string> = {
  belum: "Belum",
  proses: "Proses",
  selesai: "Selesai",
};

export default function ProgresTable({ data }: { data: ProgressBaris[] }) {
  const [dibuka, setDibuka] = useState<number | null>(null);

  const perSiswa = useMemo(() => {
    const map = new Map<number, { siswa: ProgressBaris["siswa"]; baris: ProgressBaris[] }>();
    for (const row of data) {
      if (!map.has(row.siswa.id)) {
        map.set(row.siswa.id, { siswa: row.siswa, baris: [] });
      }
      map.get(row.siswa.id)!.baris.push(row);
    }
    return Array.from(map.values());
  }, [data]);

  if (perSiswa.length === 0) {
    return <p className="text-sm text-ink/50">Belum ada siswa dengan materi untuk dipantau.</p>;
  }

  return (
    <div className="space-y-3">
      {perSiswa.map(({ siswa, baris }) => {
        const terbuka = dibuka === siswa.id;
        const selesai = baris.filter((b) => b.status === "selesai").length;
        return (
          <div key={siswa.id} className="rounded-2xl border border-line bg-white overflow-hidden">
            <button
              onClick={() => setDibuka(terbuka ? null : siswa.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-paper/60 transition-colors"
            >
              <div>
                <p className="font-semibold text-ink">{siswa.nama_lengkap}</p>
                <p className="text-xs text-ink/50">
                  {siswa.kelas} · Angkatan {siswa.angkatan}
                  {siswa.is_abk && " · ABK"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink/50">
                  {selesai}/{baris.length} selesai
                </span>
                <span className="text-ink/30">{terbuka ? "▲" : "▼"}</span>
              </div>
            </button>

            {terbuka && (
              <ul className="border-t border-line divide-y divide-line">
                {baris.map((b) => (
                  <li key={b.materi_id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-ink/80">{b.materi_judul}</span>
                    <span className="flex items-center gap-1.5 text-xs text-ink/50">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[b.status]}`} />
                      {STATUS_LABEL[b.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
