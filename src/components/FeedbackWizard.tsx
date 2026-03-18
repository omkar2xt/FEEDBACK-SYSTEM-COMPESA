import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, MicOff, Sparkles } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { analyzeFeedback } from "../services/aiService";
import { saveFeedback } from "../services/feedbackService";
import type { AnalysisResult, FeedbackInput } from "../types";
import { EmojiMood } from "./EmojiMood";
import { LiquidProgress } from "./LiquidProgress";
import { MagneticButton } from "./MagneticButton";
import { StarRating } from "./StarRating";
import { TypingQuestion } from "./TypingQuestion";

interface FeedbackWizardProps {
  draft: FeedbackInput;
  setDraft: Dispatch<SetStateAction<FeedbackInput>>;
  onSubmitted: () => void;
  click: () => void;
  success: () => void;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechCtor = new () => SpeechRecognitionLike;

const steps = ["identity", "mood", "rating", "message", "followup", "review"] as const;

export function FeedbackWizard({ draft, setDraft, onSubmitted, click, success }: FeedbackWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  const activeStep = steps[stepIndex];

  const completion = ((stepIndex + 1) / steps.length) * 100;

  const shouldAskFollowup = useMemo(
    () => draft.mood === "sad" || draft.rating <= 2 || (analysis && analysis.sentiment === "Negative"),
    [analysis, draft.mood, draft.rating]
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!draft.message.trim()) return;
      setAnalyzing(true);
      const result = await analyzeFeedback(draft.message);
      setAnalysis(result);
      setAnalyzing(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [draft.message]);

  const next = () => {
    click();
    setError("");

    if (activeStep === "identity" && !draft.name.trim()) {
      setError("Please tell us your name before continuing.");
      return;
    }

    if (activeStep === "rating" && draft.rating === 0) {
      setError("Select a star rating to continue.");
      return;
    }

    if (activeStep === "message" && !draft.message.trim()) {
      setError("Share your feedback so we can analyze it.");
      return;
    }

    if (activeStep === "followup" && shouldAskFollowup && !draft.followUp?.trim()) {
      setError("Please add a quick follow-up detail.");
      return;
    }

    if (activeStep === "message" && !shouldAskFollowup) {
      setStepIndex(steps.indexOf("review"));
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    click();
    setError("");

    if (activeStep === "review" && !shouldAskFollowup) {
      setStepIndex(steps.indexOf("message"));
      return;
    }

    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      ((window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor })
        .SpeechRecognition ||
        (window as Window & { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition) ??
      null;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    click();
    setError("");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDraft((prev) => ({ ...prev, message: `${prev.message} ${transcript}`.trim() }));
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");

    const finalAnalysis = analysis ?? (await analyzeFeedback(draft.message));
    setAnalysis(finalAnalysis);

    try {
      await saveFeedback({
        ...draft,
        createdAt: Date.now(),
        sentiment: finalAnalysis.sentiment,
        sentimentScore: finalAnalysis.score,
        summary: finalAnalysis.summary
      });

      confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.65 },
        colors: ["#27F4F1", "#3F7DFF", "#7CFF7C", "#FF5B9E"]
      });

      if (navigator.vibrate) {
        navigator.vibrate([20, 30, 20]);
      }

      success();
      onSubmitted();
    } catch {
      setError("Something went wrong while saving feedback. Please retry.");
    } finally {
      setSubmitting(false);
    }
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
          {activeStep === "identity" && (
            <>
              <TypingQuestion text="First, who are we hearing from today?" />
              <input
                aria-label="Your name"
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none ring-cyan-300/60 transition focus:ring"
                placeholder="Name"
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                aria-label="Email"
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none ring-cyan-300/60 transition focus:ring"
                placeholder="Email (optional)"
                value={draft.email}
                onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
              />
            </>
          )}

          {activeStep === "mood" && (
            <>
              <TypingQuestion text="How did this experience feel overall?" />
              <EmojiMood value={draft.mood} onChange={(mood) => setDraft((prev) => ({ ...prev, mood }))} />
              <select
                aria-label="Feedback category"
                value={draft.category}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, category: event.target.value as FeedbackInput["category"] }))
                }
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none ring-cyan-300/60 transition focus:ring"
              >
                <option value="UX">UX</option>
                <option value="Performance">Performance</option>
                <option value="Features">Features</option>
                <option value="Support">Support</option>
              </select>
            </>
          )}

          {activeStep === "rating" && (
            <>
              <TypingQuestion text="What score would you give this product?" />
              <StarRating value={draft.rating} onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))} />
            </>
          )}

          {activeStep === "message" && (
            <>
              <TypingQuestion text="Tell us what stood out. Be as specific as possible." />
              <textarea
                aria-label="Feedback message"
                rows={5}
                value={draft.message}
                onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none ring-cyan-300/60 transition focus:ring"
                placeholder="Share your honest thoughts..."
              />

              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton onClick={startVoiceInput} className="px-4 py-2 text-sm">
                  {listening ? <MicOff className="mr-2 inline h-4 w-4" /> : <Mic className="mr-2 inline h-4 w-4" />}
                  {listening ? "Listening..." : "Voice Input"}
                </MagneticButton>
                {analyzing && <p className="text-sm text-cyan-200">Analyzing sentiment in real-time...</p>}
              </div>

              {analysis && (
                <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-4">
                  <p className="text-sm text-cyan-100">
                    <Sparkles className="mr-1 inline h-4 w-4" />
                    Sentiment: {analysis.sentiment}
                  </p>
                  <p className="mt-2 text-sm text-slate-200">Summary: {analysis.summary}</p>
                  <ul className="mt-3 space-y-1 text-sm text-cyan-50">
                    {analysis.suggestions.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {activeStep === "followup" && (
            <>
              <TypingQuestion text="Quick follow-up: what one change would help you most?" />
              <textarea
                aria-label="Follow-up detail"
                rows={4}
                value={draft.followUp}
                onChange={(event) => setDraft((prev) => ({ ...prev, followUp: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none ring-cyan-300/60 transition focus:ring"
                placeholder="A concrete improvement request..."
              />
            </>
          )}

          {activeStep === "review" && (
            <>
              <TypingQuestion text="Final check. Ready to launch your feedback to the team?" />
              <div className="space-y-2 rounded-xl border border-white/15 bg-slate-900/60 p-4 text-sm text-slate-200">
                <p>Name: {draft.name || "Anonymous"}</p>
                <p>Mood: {draft.mood}</p>
                <p>Rating: {draft.rating} / 5</p>
                <p>Category: {draft.category}</p>
                <p>Recommend: {draft.wouldRecommend ? "Yes" : "No"}</p>
                <p className="text-cyan-100">Sentiment: {analysis?.sentiment ?? "Pending"}</p>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={draft.wouldRecommend}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, wouldRecommend: event.target.checked }))
                  }
                />
                I would recommend this product.
              </label>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {stepIndex > 0 && <MagneticButton onClick={back}>Back</MagneticButton>}
        {activeStep !== "review" && <MagneticButton onClick={next}>Continue</MagneticButton>}
        {activeStep === "review" && (
          <MagneticButton onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </MagneticButton>
        )}
      </div>
    </section>
  );
}
