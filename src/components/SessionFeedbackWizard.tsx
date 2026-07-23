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

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSession || !selectedYear) return;
    setSubmitting(true);
    setError("");

    const answerInputs: AnswerInput[] = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      answerValue: val
    }));

    let overallRating = 5;
    let recommendation = "Yes";

    const starQ = questions.find((q) => q.questionType === "star_rating");
    const emojiQ = questions.find((q) => q.questionType === "emoji_rating");

    if (starQ && answers[starQ.id] !== undefined && answers[starQ.id] !== null && answers[starQ.id] !== "") {
      const parsed = Number(answers[starQ.id]);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        overallRating = parsed;
      }
    } else if (emojiQ && answers[emojiQ.id] !== undefined && answers[emojiQ.id] !== null) {
      const valStr = String(answers[emojiQ.id]).toLowerCase();
      if (valStr.includes("1") || valStr.includes("poor") || valStr.includes("terrible") || valStr.includes("bad")) {
        overallRating = 1;
      } else if (valStr.includes("2") || valStr.includes("fair")) {
        overallRating = 2;
      } else if (valStr.includes("3") || valStr.includes("average") || valStr.includes("okay")) {
        overallRating = 3;
      } else if (valStr.includes("4") || valStr.includes("good")) {
        overallRating = 4;
      } else if (valStr.includes("5") || valStr.includes("excellent") || valStr.includes("awesome") || valStr.includes("great")) {
        overallRating = 5;
      }
    }

    const yesNoQ = questions.find((q) => q.questionType === "yes_no");
    if (yesNoQ && answers[yesNoQ.id] !== undefined && answers[yesNoQ.id] !== null) {
      const valStr = String(answers[yesNoQ.id]).trim().toLowerCase();
      if (valStr.includes("yes")) recommendation = "Yes";
      else if (valStr.includes("no")) recommendation = "No";
      else recommendation = "Maybe";
    } else {
      let foundMatch = false;
      for (const q of questions) {
        if (answers[q.id] !== undefined && answers[q.id] !== null) {
          const valStr = String(answers[q.id]).trim().toLowerCase();
          if (valStr === "yes" || valStr === "no" || valStr === "maybe") {
            recommendation = valStr === "yes" ? "Yes" : valStr === "no" ? "No" : "Maybe";
            foundMatch = true;
            break;
          }
        }
      }
      if (!foundMatch) {
        recommendation = "Yes";
      }
    }

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
                      placeholder="e.g. 21CS101"
                      className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <MagneticButton onClick={handleProceedFromIdentity}>
                    Continue to Questions →
                  </MagneticButton>
                </div>
              </div>
            )}

            {activeStep === "questions" && currentQuestion && (
              <div className="space-y-6">
                <DynamicQuestionRenderer
                  question={currentQuestion}
                  value={answers[currentQuestion.id]}
                  onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                />

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <MagneticButton onClick={backQuestion}>
                    ← Back
                  </MagneticButton>

                  <MagneticButton onClick={nextQuestion} disabled={submitting}>
                    {submitting
                      ? "Submitting..."
                      : questionIndex === questions.length - 1
                      ? "Submit Feedback ✨"
                      : "Next Question →"}
                  </MagneticButton>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && <p className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}
    </section>
  );
}
