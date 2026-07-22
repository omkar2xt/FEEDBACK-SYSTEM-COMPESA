import { useState } from "react";
import type { QuestionItem, QuestionType, YearItem } from "../types";
import { DynamicQuestionRenderer } from "./DynamicQuestionRenderer";
import { MagneticButton } from "./MagneticButton";

interface QuestionBuilderProps {
  years: YearItem[];
  questions: QuestionItem[];
  onCreateQuestion: (data: Partial<QuestionItem>) => Promise<void>;
  onUpdateQuestion: (id: string, data: Partial<QuestionItem>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
}

const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: "short_text", label: "Short Text" },
  { type: "paragraph", label: "Paragraph / Essay" },
  { type: "star_rating", label: "Star Rating (1-5)" },
  { type: "emoji_rating", label: "Emoji Satisfaction Rating" },
  { type: "yes_no", label: "Yes / No Toggle" },
  { type: "single_choice", label: "Single Choice (Radio)" },
  { type: "multiple_choice", label: "Multiple Choice (Checkboxes)" },
  { type: "dropdown", label: "Dropdown Select" }
];

export function QuestionBuilder({
  years,
  questions,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion
}: QuestionBuilderProps) {
  const [selectedYearId, setSelectedYearId] = useState<string>(years[0]?.id || "");
  const [showAddForm, setShowAddForm] = useState(false);

  const [label, setLabel] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("short_text");
  const [optionsText, setOptionsText] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [helperText, setHelperText] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const activeYearId = selectedYearId || (years[0]?.id ?? "");
  const yearQuestions = questions
    .filter((q) => q.yearId === activeYearId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setSubmitting(true);
    const parsedOptions = optionsText
      .split("\n")
      .map((opt) => opt.trim())
      .filter(Boolean);

    try {
      await onCreateQuestion({
        yearId: activeYearId,
        label,
        questionType,
        options: parsedOptions,
        placeholder,
        helperText,
        isRequired,
        orderIndex: yearQuestions.length + 1
      });

      setLabel("");
      setOptionsText("");
      setPlaceholder("");
      setHelperText("");
      setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const moveOrder = async (q: QuestionItem, direction: "up" | "down") => {
    const idx = yearQuestions.findIndex((item) => item.id === q.id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= yearQuestions.length) return;

    const otherQ = yearQuestions[targetIdx];
    await onUpdateQuestion(q.id, { orderIndex: otherQ.orderIndex });
    await onUpdateQuestion(otherQ.id, { orderIndex: q.orderIndex });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Dynamic Question Builder</h3>
          <p className="mt-1 text-sm text-slate-300">
            Customize question sets independently per academic year. Zero code changes required.
          </p>
        </div>
        <MagneticButton onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? "Cancel" : "+ Add New Question"}
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

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-cyan-300/30 bg-slate-900/80 p-5 space-y-4">
          <h4 className="text-base font-semibold text-cyan-200">New Question Config</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">Question Prompt Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Which topic was most useful?"
                required
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                {QUESTION_TYPES.map((qt) => (
                  <option key={qt.type} value={qt.type}>
                    {qt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Required Question?</label>
              <select
                value={isRequired ? "yes" : "no"}
                onChange={(e) => setIsRequired(e.target.value === "yes")}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="yes">Yes (Required)</option>
                <option value="no">No (Optional)</option>
              </select>
            </div>

            {["single_choice", "multiple_choice", "dropdown"].includes(questionType) && (
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-300 mb-1">
                  Choice Options (Enter one option per line)
                </label>
                <textarea
                  rows={3}
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">Placeholder Text (Optional)</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="e.g. Type your response..."
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Helper Subtext (Optional)</label>
              <input
                type="text"
                value={helperText}
                onChange={(e) => setHelperText(e.target.value)}
                placeholder="e.g. Choose the option that fits best"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <MagneticButton type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Question"}
          </MagneticButton>
        </form>
      )}

      {/* Questions List & Live Preview */}
      <div className="space-y-4">
        {yearQuestions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-300/20 px-2.5 py-0.5 text-xs font-bold text-cyan-200">
                  #{idx + 1}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  {q.questionType.replace("_", " ")}
                </span>
                {q.isRequired && <span className="text-xs text-rose-300 font-bold">*Required</span>}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => void moveOrder(q, "up")}
                  className="rounded px-2 py-1 bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
                >
                  ↑ Move Up
                </button>
                <button
                  type="button"
                  disabled={idx === yearQuestions.length - 1}
                  onClick={() => void moveOrder(q, "down")}
                  className="rounded px-2 py-1 bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
                >
                  ↓ Move Down
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteQuestion(q.id)}
                  className="text-rose-300 font-medium hover:underline ml-2"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Live Student Preview Render */}
            <div className="rounded-xl bg-slate-950/60 p-4 border border-white/5">
              <p className="mb-2 text-xs uppercase tracking-wider text-cyan-300/70 font-semibold">
                Live Student Preview
              </p>
              <DynamicQuestionRenderer question={q} value={null} onChange={() => {}} />
            </div>
          </div>
        ))}

        {!yearQuestions.length && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-slate-400">
            No dynamic questions configured for this year yet. Click "+ Add New Question" above to build your question set.
          </div>
        )}
      </div>
    </div>
  );
}
