"use client";

import { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-ink/40 hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
