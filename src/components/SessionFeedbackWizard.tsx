import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import {
  fetchQuestions,
  fetchSessions,
  fetchYears,
  submitMultiYearFeedback
} from "../services/feedbackService";
import type {
  AnswerInput,
  FeedbackInput,
  QuestionItem,
  SessionItem,
  YearItem
} from "../types";
import { DynamicQuestionRenderer } from "./DynamicQuestionRenderer";
import { LiquidProgress } from "./LiquidProgress";
import { MagneticButton } from "./MagneticButton";
import { SessionPicker } from "./SessionPicker";
import { TypingQuestion } from "./TypingQuestion";
import { YearSelector } from "./YearSelector";

interface SessionFeedbackWizardProps {
  draft: FeedbackInput;
  setDraft: Dispatch<SetStateAction<FeedbackInput>>;
  onSubmitted: () => void;
  click: () => void;
  success: () => void;
}

export function SessionFeedbackWizard({ onSubmitted, click, success }: SessionFeedbackWizardProps) {
  const [years, setYears] = useState<YearItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearItem | null>(null);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);

  const [studentName, setStudentName] = useState("");
  const [division, setDivision] = useState("A");
  const [rollNo, setRollNo] = useState("");

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [activeStep, setActiveStep] = useState<"year" | "session" | "identity" | "questions">("year");
  const [questionIndex, setQuestionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchYears()
      .then((data) => {
        if (!mounted) return;
        setYears(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectYear = async (year: YearItem) => {
    click();
    setError("");
    setSelectedYear(year);
    setSelectedSession(null);
    setLoading(true);

    try {
      const sessList = await fetchSessions(year.id);
      setSessions(sessList);

      const qList = await fetchQuestions(year.id);
      setQuestions(qList);

      setActiveStep("session");
    } catch {
      setError("Failed to load sessions for selected year.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (session: SessionItem) => {
    click();
    setError("");
    setSelectedSession(session);
    setActiveStep("identity");
  };

  const handleProceedFromIdentity = () => {
    click();
    if (!studentName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!rollNo.trim()) {
      setError("Please enter your roll number.");
      return;
    }

    setError("");
    if (questions.length > 0) {
      setQuestionIndex(0);
      setActiveStep("questions");
    } else {
      // If no dynamic questions configured for year, proceed to submit
      void handleSubmit();
    }
  };

  const currentQuestion = questions[questionIndex];

  const nextQuestion = () => {
    click();
    setError("");

    if (currentQuestion) {
      const val = answers[currentQuestion.id];
      if (currentQuestion.isRequired && (val === undefined || val === "" || (Array.isArray(val) && !val.length))) {
        setError("Please answer this question before continuing.");
        return;
      }
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      void handleSubmit();
    }
  };

  const backQuestion = () => {
    click();
    setError("");
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
    } else {
      setActiveStep("identity");
    }
  };

  const handleSubmit = async () => {
    if (!selectedYear || !selectedSession) return;
    setSubmitting(true);
    setError("");

    const answerInputs: AnswerInput[] = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      answerValue: val
    }));

    // Extract overall rating from star_rating or emoji_rating questions
    const ratingQ = questions.find((q) => q.questionType === "star_rating" || q.questionType === "emoji_rating");
    let overallRating = 5;
    if (ratingQ && answers[ratingQ.id] !== undefined) {
      const val = answers[ratingQ.id];
      if (typeof val === "number" && !isNaN(val)) overallRating = val;
      else if (!isNaN(Number(val))) overallRating = Number(val);
      else if (typeof val === "string") {
        if (val.includes("😍") || val.toLowerCase().includes("excellent") || val.toLowerCase().includes("happy")) overallRating = 5;
        else if (val.includes("🙂") || val.toLowerCase().includes("good")) overallRating = 4;
        else if (val.includes("😐") || val.toLowerCase().includes("average") || val.toLowerCase().includes("neutral")) overallRating = 3;
        else if (val.includes("🙁") || val.toLowerCase().includes("poor") || val.toLowerCase().includes("sad")) overallRating = 2;
      }
    }

    // Find recommendation question value if present
    const recQ = questions.find((q) => q.questionType === "yes_no" || q.label.toLowerCase().includes("recommend"));
    const recommendation = recQ && answers[recQ.id] === "No" ? "No" : "Yes";

    try {
      await submitMultiYearFeedback({
        sessionId: selectedSession.id,
        yearId: selectedYear.id,
        studentName,
        division,
        rollNo,
        overallRating,
        recommendation,
        answers: answerInputs
      });

      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#27F4F1", "#3F7DFF", "#7CFF7C", "#FF5B9E"]
      });

      success();
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Progress Calculation
  const totalSteps = 3 + (questions.length || 1);
  let currentStepNum = 1;
  if (activeStep === "session") currentStepNum = 2;
  if (activeStep === "identity") currentStepNum = 3;
  if (activeStep === "questions") currentStepNum = 4 + questionIndex;
  const progressPercent = Math.min(100, (currentStepNum / totalSteps) * 100);

  return (
    <section className="rounded-3xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl sm:p-8">
      <LiquidProgress progress={progressPercent} />
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
        Step {currentStepNum} of {totalSteps}
      </p>

      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <p className="mt-3 text-sm text-cyan-100">Loading form...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep === "questions" ? `q-${questionIndex}` : activeStep}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-6 space-y-5"
          >
            {activeStep === "year" && (
              <YearSelector
                years={years}
                selectedYearId={selectedYear?.id || null}
                onSelectYear={handleSelectYear}
              />
            )}

            {activeStep === "session" && selectedYear && (
              <div>
                <button
                  type="button"
                  onClick={() => setActiveStep("year")}
                  className="mb-4 text-xs font-semibold text-cyan-300 hover:underline"
                >
                  ← Back to Year Selection ({selectedYear.label})
                </button>
                <SessionPicker
                  sessions={sessions}
                  selectedSessionId={selectedSession?.id || null}
                  onSelectSession={handleSelectSession}
                />
              </div>
            )}

            {activeStep === "identity" && selectedSession && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveStep("session")}
                  className="mb-2 text-xs font-semibold text-cyan-300 hover:underline"
                >
                  ← Back to Sessions ({selectedSession.title})
                </button>
                <TypingQuestion text="Please enter your student details" />

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-cyan-200 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-cyan-200 mb-1">Division</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                    >
                      {["A", "B", "C", "D"].map((div) => (
                        <option key={div} value={div} className="bg-slate-900 text-white">
                          Division {div}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-cyan-200 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === "questions" && currentQuestion && (
              <DynamicQuestionRenderer
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {activeStep === "identity" && (
          <MagneticButton onClick={handleProceedFromIdentity}>
            Continue to Questions →
          </MagneticButton>
        )}

        {activeStep === "questions" && (
          <>
            <MagneticButton onClick={backQuestion}>Back</MagneticButton>
            <MagneticButton onClick={nextQuestion} disabled={submitting}>
              {submitting
                ? "Submitting..."
                : questionIndex === questions.length - 1
                ? "Submit Feedback"
                : "Next Question →"}
            </MagneticButton>
          </>
        )}
      </div>
    </section>
  );
}
