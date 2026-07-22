import { motion } from "framer-motion";
import type { YearItem } from "../types";

interface YearSelectorProps {
  years: YearItem[];
  selectedYearId: string | null;
  onSelectYear: (year: YearItem) => void;
}

export function YearSelector({ years, selectedYearId, onSelectYear }: YearSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Select Your Academic Year</h3>
        <p className="mt-1 text-sm text-slate-300">
          Feedback is unlocked per year by session organizers. Select your active year to proceed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => {
          const isSelected = selectedYearId === year.id;
          const isDisabled = !year.isOpen;

          return (
            <motion.button
              key={year.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectYear(year)}
              whileHover={!isDisabled ? { scale: 1.02 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                isDisabled
                  ? "cursor-not-allowed border-white/5 bg-slate-900/30 opacity-50"
                  : isSelected
                  ? "border-cyan-300 bg-cyan-300/15 shadow-glow"
                  : "border-white/15 bg-slate-900/60 hover:border-cyan-300/50 hover:bg-slate-900/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">{year.code}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      year.isOpen ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {year.isOpen ? "Open for Feedback" : "Feedback Closed"}
                  </span>
                </div>
                <h4 className="mt-3 text-lg font-bold text-white">{year.label}</h4>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{year.isOpen ? "Click to select session" : "Currently locked"}</span>
                {isSelected && <span className="font-semibold text-cyan-300">Selected ✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
