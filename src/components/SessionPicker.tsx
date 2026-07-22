import { motion } from "framer-motion";
import type { SessionItem } from "../types";

interface SessionPickerProps {
  sessions: SessionItem[];
  selectedSessionId: string | null;
  onSelectSession: (session: SessionItem) => void;
}

export function SessionPicker({ sessions, selectedSessionId, onSelectSession }: SessionPickerProps) {
  if (!sessions.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-slate-400">
        No active sessions organized for this academic year yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Select Guidance Session</h3>
        <p className="mt-1 text-sm text-slate-300">Choose the specific class or guidance session you attended.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => {
          const isSelected = selectedSessionId === session.id;
          const isDisabled = !session.feedbackOpen;

          return (
            <motion.button
              key={session.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectSession(session)}
              whileHover={!isDisabled ? { scale: 1.01 } : undefined}
              whileTap={!isDisabled ? { scale: 0.99 } : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-5 text-left transition ${
                isDisabled
                  ? "cursor-not-allowed border-white/5 bg-slate-900/30 opacity-50"
                  : isSelected
                  ? "border-cyan-300 bg-cyan-300/15 shadow-glow"
                  : "border-white/15 bg-slate-900/60 hover:border-cyan-300/50 hover:bg-slate-900/80"
              }`}
            >
              <div>
                <h4 className="text-base font-bold text-white">{session.title}</h4>
                {session.description && <p className="mt-2 text-xs text-slate-300">{session.description}</p>}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
                {session.venue && <span>📍 {session.venue}</span>}
                {session.sessionDate && <span>📅 {session.sessionDate}</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
