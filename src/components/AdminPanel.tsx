import { useEffect, useState } from "react";
import type { FeedbackRecord } from "../types";
import { subscribeFeedbackRealtime } from "../services/feedbackService";

interface AdminPanelProps {
  isOpen: boolean;
}

export function AdminPanel({ isOpen }: AdminPanelProps) {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeFeedbackRealtime(setRecords);
    return () => unsubscribe();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl" aria-live="polite">
      <h3 className="mb-4 text-xl font-semibold text-white">Admin Feed</h3>
      <div className="max-h-[300px] space-y-3 overflow-auto pr-2">
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <p className="text-sm text-slate-300">
              {record.name || "Anonymous"} • {record.category} • {record.sentiment}
            </p>
            <p className="mt-1 text-sm text-white/90">{record.summary}</p>
          </article>
        ))}
        {!records.length && <p className="text-sm text-slate-400">No responses yet.</p>}
      </div>
    </section>
  );
}
