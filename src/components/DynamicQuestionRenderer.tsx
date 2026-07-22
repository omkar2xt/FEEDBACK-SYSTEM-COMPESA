import type { QuestionItem } from "../types";
import { StarRating } from "./StarRating";
import { TypingQuestion } from "./TypingQuestion";

interface DynamicQuestionRendererProps {
  question: QuestionItem;
  value: any;
  onChange: (val: any) => void;
}

export function DynamicQuestionRenderer({ question, value, onChange }: DynamicQuestionRendererProps) {
  const { label, questionType, options, placeholder, helperText } = question;

  return (
    <div className="space-y-4">
      <TypingQuestion text={label} />
      {helperText && <p className="text-xs text-cyan-200/80">{helperText}</p>}

      {questionType === "short_text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Type your answer..."}
          className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        />
      )}

      {questionType === "paragraph" && (
        <textarea
          rows={5}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Share your detailed thoughts..."}
          className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        />
      )}

      {questionType === "star_rating" && (
        <StarRating value={Number(value || 0)} onChange={(rating) => onChange(rating)} />
      )}

      {questionType === "emoji_rating" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "😃 Excellent", value: "Excellent" },
            { label: "🙂 Good", value: "Good" },
            { label: "😐 Average", value: "Average" },
            { label: "😕 Poor", value: "Poor" }
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                value === opt.value
                  ? "border-cyan-300 bg-cyan-300/20 shadow-glow text-white"
                  : "border-white/20 bg-slate-900/60 text-slate-200 hover:border-cyan-300/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {questionType === "yes_no" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-xl border px-4 py-3 text-center font-medium transition ${
                value === opt
                  ? "border-cyan-300 bg-cyan-300/20 shadow-glow text-white"
                  : "border-white/20 bg-slate-900/60 text-slate-200 hover:border-cyan-300/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {questionType === "single_choice" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(options || []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                value === opt
                  ? "border-cyan-300 bg-cyan-300/20 shadow-glow text-white"
                  : "border-white/20 bg-slate-900/60 text-slate-200 hover:border-cyan-300/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {questionType === "multiple_choice" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(options || []).map((opt) => {
            const currentList: string[] = Array.isArray(value) ? value : [];
            const isSelected = currentList.includes(opt);
            const toggle = () => {
              if (isSelected) {
                onChange(currentList.filter((item) => item !== opt));
              } else {
                onChange([...currentList, opt]);
              }
            };

            return (
              <button
                key={opt}
                type="button"
                onClick={toggle}
                className={`rounded-xl border px-4 py-3 text-left transition flex items-center justify-between ${
                  isSelected
                    ? "border-cyan-300 bg-cyan-300/20 shadow-glow text-white"
                    : "border-white/20 bg-slate-900/60 text-slate-200 hover:border-cyan-300/50"
                }`}
              >
                <span>{opt}</span>
                <span>{isSelected ? "☑" : "☐"}</span>
              </button>
            );
          })}
        </div>
      )}

      {questionType === "dropdown" && (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        >
          <option value="" disabled>
            -- Select an option --
          </option>
          {(options || []).map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-white">
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
