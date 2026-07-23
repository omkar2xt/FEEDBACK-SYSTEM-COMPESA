import { useState } from "react";
import type { SessionItem, YearItem } from "../types";
import { MagneticButton } from "./MagneticButton";

interface SessionManagerProps {
  years: YearItem[];
  sessions: SessionItem[];
  onCreateSession: (data: Partial<SessionItem>) => Promise<void>;
  onUpdateSession: (id: string, data: Partial<SessionItem>) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
}

export function SessionManager({
  years,
  sessions,
  onCreateSession,
  onUpdateSession,
  onDeleteSession
}: SessionManagerProps) {
  const [selectedYearId, setSelectedYearId] = useState<string>(years[0]?.id || "");
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [venue, setVenue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeYearId = selectedYearId || (years[0]?.id ?? "");
  const activeYearObj = years.find((y) => y.id === activeYearId || y.code === activeYearId);

  const yearSessions = sessions.filter((s) => {
    if (s.yearId === activeYearId) return true;
    if (activeYearObj && (s.yearId === activeYearObj.id || s.yearId === activeYearObj.code)) return true;
    if (activeYearObj && s.yearId && s.yearId.toLowerCase().includes(activeYearObj.code.toLowerCase())) return true;
    return false;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onCreateSession({
        yearId: activeYearId,
        title,
        description,
        sessionDate,
        venue,
        feedbackOpen: true
      });
      setTitle("");
      setDescription("");
      setSessionDate("");
      setVenue("");
      setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Session Manager</h3>
          <p className="mt-1 text-sm text-slate-300">Create and manage feedback sessions organized for each year.</p>
        </div>
        <MagneticButton onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? "Cancel" : "+ Add New Session"}
        </MagneticButton>
      </div>

      {/* Year Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {years.map((y) => (
          <button
            key={y.id}
            type="button"
            onClick={() => setSelectedYearId(y.id)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeYearId === y.id
                ? "bg-cyan-300 text-slate-950 font-bold shadow-glow"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {y.code} ({y.label})
          </button>
        ))}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-cyan-300/30 bg-slate-900/80 p-5 space-y-4">
          <h4 className="text-base font-semibold text-cyan-200">Create Session</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Session Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures Guidance"
                required
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium / Lab 3"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <MagneticButton type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Session"}
          </MagneticButton>
        </form>
      )}

      {/* Session Table */}
      <div className="overflow-auto rounded-2xl border border-white/15 bg-panel shadow-glass">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-white/10 bg-slate-900/60 text-xs uppercase text-cyan-200">
            <tr>
              <th className="px-4 py-3">Session Title</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {yearSessions.map((sess) => (
              <tr key={sess.id} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{sess.title}</p>
                  {sess.description && <p className="text-xs text-slate-400">{sess.description}</p>}
                </td>
                <td className="px-4 py-3">{sess.venue || "—"}</td>
                <td className="px-4 py-3">{sess.sessionDate || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void onUpdateSession(sess.id, { feedbackOpen: !sess.feedbackOpen })}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      sess.feedbackOpen
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {sess.feedbackOpen ? "Open" : "Closed"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void onDeleteSession(sess.id)}
                    className="text-xs font-medium text-rose-300 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!yearSessions.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No sessions created for this year yet. Click "+ Add New Session" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
