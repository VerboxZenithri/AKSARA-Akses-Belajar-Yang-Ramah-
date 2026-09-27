"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardHeader({
  eyebrow,
  connected,
}: {
  eyebrow: string;
  connected?: boolean;
}) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4 lg:px-10 bg-white">
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
          SMKN 1 · {eyebrow}
        </p>
        <h1 className="font-display text-xl font-bold text-ink">
          {user?.nama_lengkap}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {connected !== undefined && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-ink/50">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-status-selesai" : "bg-ink/20"
              }`}
            />
            {connected ? "Real-time aktif" : "Menyambungkan..."}
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm font-medium text-ink/60 hover:text-status-belum transition-colors"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
