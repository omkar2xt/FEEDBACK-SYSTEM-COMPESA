import type { Mood } from "../types";

const moods: Array<{ key: Mood; label: string; emoji: string }> = [
  { key: "happy", label: "Great", emoji: "😃" },
  { key: "neutral", label: "Okay", emoji: "😐" },
  { key: "sad", label: "Needs Work", emoji: "😞" }
];

interface EmojiMoodProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

export function EmojiMood({ value, onChange }: EmojiMoodProps) {
  return (
    <div className="flex items-center gap-3" role="radiogroup" aria-label="Mood feedback">
      {moods.map((mood) => (
        <button
          key={mood.key}
          type="button"
          onClick={() => onChange(mood.key)}
          className={`rounded-2xl border px-4 py-3 text-xl transition ${
            value === mood.key
              ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
              : "border-white/20 bg-white/5 hover:border-cyan-300/50"
          }`}
          role="radio"
          aria-checked={value === mood.key}
          aria-label={mood.label}
        >
          <span className="block">{mood.emoji}</span>
        </button>
      ))}
    </div>
  );
}
