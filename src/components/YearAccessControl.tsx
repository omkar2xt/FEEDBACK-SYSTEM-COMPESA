import { useState } from "react";
import type { YearItem } from "../types";
import { MagneticButton } from "./MagneticButton";

interface YearAccessControlProps {
  years: YearItem[];
  onToggleOpen: (yearId: string, isOpen: boolean) => Promise<void>;
}

export function YearAccessControl({ years, onToggleOpen }: YearAccessControlProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (year: YearItem) => {
    setTogglingId(year.id);
    try {
      await onToggleOpen(year.id, !year.isOpen);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Year-Level Access Control</h3>
        <p className="mt-1 text-sm text-slate-300">
          Toggle feedback access open or closed for each academic year. Locked years cannot receive student submissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => {
          const isToggling = togglingId === year.id;

          return (
            <div
              key={year.id}
              className={`rounded-2xl border p-5 transition ${
                year.isOpen
                  ? "border-emerald-500/40 bg-emerald-500/10 shadow-glass"
                  : "border-white/15 bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">{year.code}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    year.isOpen
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {year.isOpen ? "OPEN" : "LOCKED"}
                </span>
              </div>

              <h4 className="mt-3 text-lg font-bold text-white">{year.label}</h4>

              <div className="mt-5">
                <MagneticButton onClick={() => void handleToggle(year)} disabled={isToggling}>
                  {isToggling ? "Updating..." : year.isOpen ? "Lock Feedback 🔒" : "Unlock Feedback 🔓"}
                </MagneticButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
