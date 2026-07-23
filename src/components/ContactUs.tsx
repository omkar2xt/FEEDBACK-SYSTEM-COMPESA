import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchCoordinators } from "../services/feedbackService";
import type { CoordinatorItem } from "../types";
import { MagneticButton } from "./MagneticButton";

interface ContactUsProps {
  onStartFeedback: () => void;
  onBack?: () => void;
}

export function ContactUs({ onStartFeedback, onBack }: ContactUsProps) {
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCoordinators();
      setCoordinators(data);
    } catch {
      setError("Failed to load coordinator contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl">
                📞
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Contact Us</h2>
                <p className="mt-1 text-sm text-cyan-200/90">
                  Need any help regarding this session? Feel free to contact our coordinators.
                </p>
              </div>
            </div>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="self-start rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              ← Back to Selection
            </button>
          )}
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full rounded bg-slate-800" />
                  <div className="h-3 w-4/5 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
            <p className="text-sm text-rose-300 font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-100 hover:bg-rose-500/40 transition"
            >
              🔄 Retry Loading
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && coordinators.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center space-y-3">
            <span className="text-4xl">👨‍🎓</span>
            <p className="text-sm font-semibold text-slate-300">
              No coordinators listed at the moment. You can proceed directly to feedback!
            </p>
          </div>
        )}

        {/* COORDINATOR CARDS GRID */}
        {!loading && !error && coordinators.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coordinators.map((coordinator, idx) => {
              const initials = coordinator.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={coordinator.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/10"
                >
                  <div className="flex items-start gap-4">
                    {coordinator.photoUrl ? (
                      <img
                        src={coordinator.photoUrl}
                        alt={coordinator.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-cyan-400/30 shadow-md"
                        onError={(e) => {
                          // Fallback on broken image link
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-xl font-extrabold text-cyan-300 shadow-md">
                        {initials || "👨‍🎓"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="inline-block rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {coordinator.role || "Coordinator"}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-white truncate">
                        {coordinator.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-xs">
                    {coordinator.email && (
                      <a
                        href={`mailto:${coordinator.email}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition truncate"
                      >
                        <span className="text-cyan-400 font-bold">📧</span>
                        <span className="truncate">{coordinator.email}</span>
                      </a>
                    )}

                    {coordinator.phone && (
                      <a
                        href={`tel:${coordinator.phone}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition truncate"
                      >
                        <span className="text-emerald-400 font-bold">📱</span>
                        <span>{coordinator.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Social Buttons */}
                  <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                    {coordinator.linkedinUrl && (
                      <a
                        href={
                          coordinator.linkedinUrl.startsWith("http://") || coordinator.linkedinUrl.startsWith("https://")
                            ? coordinator.linkedinUrl
                            : `https://${coordinator.linkedinUrl.trim()}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-400/10 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-400/20 hover:text-white"
                      >
                        <span>🔗</span> LinkedIn
                      </a>
                    )}

                    {coordinator.githubUrl && (
                      <a
                        href={
                          coordinator.githubUrl.startsWith("http://") || coordinator.githubUrl.startsWith("https://")
                            ? coordinator.githubUrl
                            : `https://${coordinator.githubUrl.trim()}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                      >
                        <span>🐙</span> GitHub
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* BOTTOM CALL TO ACTION BUTTON */}
        <div className="mt-8 flex justify-center border-t border-white/10 pt-6">
          <MagneticButton onClick={onStartFeedback} className="px-8 py-3.5 text-base font-bold shadow-glow">
            🚀 Start Feedback
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
