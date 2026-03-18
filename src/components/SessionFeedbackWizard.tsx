import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { saveFeedbackDeferred } from "../services/feedbackService";
import type { FeedbackInput, FeedbackRecord } from "../types";
import { LiquidProgress } from "./LiquidProgress";
import { MagneticButton } from "./MagneticButton";
import { StarRating } from "./StarRating";
import { TypingQuestion } from "./TypingQuestion";

interface SessionFeedbackWizardProps {
  draft: FeedbackInput;
  setDraft: Dispatch<SetStateAction<FeedbackInput>>;
  onSubmitted: () => void;
  click: () => void;
  success: () => void;
}

const steps = [
  "name",
  "overall",
  "rating",
  "topic",
  "clarity",
  "engagement",
  "speaker",
  "feedback",
  "suggestions",
  "recommendation"
] as const;

export function SessionFeedbackWizard({ draft, setDraft, onSubmitted, click, success }: SessionFeedbackWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeStep = steps[stepIndex];
  const completion = ((stepIndex + 1) / steps.length) * 100;

  const next = () => {
    click();
    setError("");

    if (activeStep === "name" && !draft.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (activeStep === "rating" && draft.rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (activeStep === "feedback" && !draft.message.trim()) {
      setError("Please share your feedback before continuing.");
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    click();
    setError("");
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");

    const sentiment: FeedbackRecord["sentiment"] = draft.rating >= 4 ? "Positive" : draft.rating <= 2 ? "Negative" : "Neutral";
    const score = draft.rating / 5;
    const payload = {
      ...draft,
      id: globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      wouldRecommend: draft.recommendation === "Yes",
      sentiment,
      sentimentScore: score,
      summary: "Student feedback submitted successfully.",
      createdAt: Date.now()
    };

    const saveState = await saveFeedbackDeferred(payload, 3200);

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.65 },
      colors: ["#27F4F1", "#3F7DFF", "#7CFF7C", "#FF5B9E"]
    });

    success();
    onSubmitted();
    if (saveState === "queued") {
      // Non-blocking warning for slow/offline networks; record will auto-sync on next focus/start.
      console.warn("Feedback queued for retry because cloud submit was slow or unavailable.");
    }
    setSubmitting(false);
  };

  return (
    <section className="rounded-3xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl sm:p-8">
      <LiquidProgress progress={completion} />
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
        Step {stepIndex + 1} of {steps.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-6 space-y-5"
        >
          {activeStep === "name" && (
            <>
              <TypingQuestion text="First, who are we hearing from?" />
              <input
                aria-label="Student name"
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                placeholder="Enter your name"
              />
            </>
          )}

          {activeStep === "overall" && (
            <>
              <TypingQuestion text="How was your overall experience of the session?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "😃 Excellent", value: "Excellent", mood: "happy" },
                  { label: "🙂 Good", value: "Good", mood: "happy" },
                  { label: "😐 Average", value: "Average", mood: "neutral" },
                  { label: "😕 Poor", value: "Poor", mood: "sad" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        overallExperience: option.value as FeedbackInput["overallExperience"],
                        mood: option.mood as FeedbackInput["mood"]
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.overallExperience === option.value
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeStep === "rating" && (
            <>
              <TypingQuestion text="How would you rate this session?" />
              <StarRating value={draft.rating} onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))} />
            </>
          )}

          {activeStep === "topic" && (
            <>
              <TypingQuestion text="Which part of the session helped you the most?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Mini Projects",
                  "GitHub",
                  "LinkedIn",
                  "Latest Technologies",
                  "Career Guidance"
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, mostUsefulTopic: topic as FeedbackInput["mostUsefulTopic"] }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.mostUsefulTopic === topic
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeStep === "clarity" && (
            <>
              <TypingQuestion text="Was the session easy to understand?" />
              <div className="grid gap-3">
                {["Very clear", "Somewhat clear", "Difficult"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, clarity: value as FeedbackInput["clarity"] }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.clarity === value
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeStep === "engagement" && (
            <>
              <TypingQuestion text="How engaging was the session?" />
              <div className="grid gap-3">
                {["Very engaging", "Okay", "Boring"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, engagement: value as FeedbackInput["engagement"] }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.engagement === value
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeStep === "speaker" && (
            <>
              <TypingQuestion text="How was the speaker and support team during the session?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {["Excellent", "Good", "Average", "Needs improvement"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        speakerSupport: value as FeedbackInput["speakerSupport"]
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.speakerSupport === value
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeStep === "feedback" && (
            <>
              <TypingQuestion text="Tell us your honest feedback..." />
              <textarea
                rows={5}
                value={draft.message}
                onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                placeholder="What did you like? What can we improve?"
              />
            </>
          )}

          {activeStep === "suggestions" && (
            <>
              <TypingQuestion text="Any suggestions for future sessions? (Optional)" />
              <textarea
                rows={4}
                value={draft.suggestions || ""}
                onChange={(event) => setDraft((prev) => ({ ...prev, suggestions: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                placeholder="Optional suggestions"
              />
            </>
          )}

          {activeStep === "recommendation" && (
            <>
              <TypingQuestion text="Would you recommend this session to your friends?" />
              <div className="grid gap-3">
                {["Yes", "Maybe", "No"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        recommendation: value as FeedbackInput["recommendation"],
                        wouldRecommend: value === "Yes"
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      draft.recommendation === value
                        ? "border-cyan-300 bg-cyan-300/20 shadow-glow"
                        : "border-white/20 bg-slate-900/60 hover:border-cyan-300/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {stepIndex > 0 && <MagneticButton onClick={back}>Back</MagneticButton>}
        {activeStep !== "recommendation" && <MagneticButton onClick={next}>Continue</MagneticButton>}
        {activeStep === "recommendation" && (
          <MagneticButton onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </MagneticButton>
        )}
      </div>
    </section>
  );
}
