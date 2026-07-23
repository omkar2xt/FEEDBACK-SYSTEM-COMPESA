import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AdminLogin } from "./components/AdminLogin";
import { ContactUs } from "./components/ContactUs";
import { CursorGlow } from "./components/CursorGlow";
import { MagneticButton } from "./components/MagneticButton";
import { SessionFeedbackWizard } from "./components/SessionFeedbackWizard";
import { SessionSummary } from "./components/SessionSummary";
import { ThreeBackground } from "./components/ThreeBackground";
import { useLocalProgress } from "./hooks/useLocalProgress";
import { useSound } from "./hooks/useSound";
import {
  clearAdminToken,
  fetchFeedback,
  flushQueuedFeedback,
  getStoredAdminToken,
  loginAdminBackend,
  subscribeFeedbackRealtime
} from "./services/feedbackService";
import type { FeedbackRecord } from "./types";

const AdminDashboard = lazy(async () => {
  const mod = await import("./components/AdminDashboard");
  return { default: mod.AdminDashboard };
});

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activePanel, setActivePanel] = useState<"feedback" | "contact" | "admin">("feedback");
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(() => Boolean(getStoredAdminToken()));
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showThanksPopup, setShowThanksPopup] = useState(false);
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const { draft, setDraft, clearDraft } = useLocalProgress();
  const sounds = useSound();

  useEffect(() => {
    void flushQueuedFeedback();

    const onFocus = () => {
      void flushQueuedFeedback();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (activePanel !== "admin" || !adminAuthenticated) {
      return;
    }

    let mounted = true;
    setAdminLoading(true);
    setAdminError("");

    fetchFeedback()
      .then((data) => {
        if (!mounted) return;
        setRecords(data);
      })
      .catch(() => {
        if (!mounted) return;
        setAdminError("Unable to fetch feedback from cloud database.");
      })
      .finally(() => {
        if (!mounted) return;
        setAdminLoading(false);
      });

    const unsubscribe = subscribeFeedbackRealtime(
      (data) => {
        if (!mounted) return;
        setRecords(data);
      },
      () => {
        if (!mounted) return;
        setAdminError("Realtime update failed. Showing latest fetched data.");
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [activePanel, adminAuthenticated]);

  useEffect(() => {
    gsap.fromTo(
      ".hero-fade",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
      }
    );

    gsap.fromTo(
      ".parallax-section",
      { backgroundPositionY: "0%" },
      {
        backgroundPositionY: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-section",
          scrub: true
        }
      }
    );
  }, []);

  const resetFlow = () => {
    clearDraft();
    setDraft({
      name: "",
      email: "",
      mood: "neutral",
      rating: 0,
      category: "UX",
      message: "",
      wouldRecommend: true,
      followUp: "",
      overallExperience: "Good",
      learningOutcome: "Some useful things",
      mostUsefulTopic: "Mini Projects",
      clarity: "Somewhat clear",
      engagement: "Okay",
      speakerSupport: "Good",
      impactPlan: "Improving skills",
      impactPlans: ["Improving skills"],
      recommendation: "Yes",
      suggestions: ""
    });
    setSubmitted(false);
    setShowThanksPopup(false);
  };

  const handleSubmitted = () => {
    setSubmitted(true);
    setShowThanksPopup(true);
  };

  const handleAdminLogin = async (username: string, password: string) => {
    const res = await loginAdminBackend(username, password);
    setAdminAuthenticated(res.ok);
    return res.ok;
  };

  const handleAdminLogout = () => {
    clearAdminToken();
    setAdminAuthenticated(false);
  };

  const thankYou = useMemo(() => {
    if (draft.rating >= 4) {
      return "Awesome! Your positive feedback motivates us to keep improving the quality of guidance.";
    }
    if (draft.rating <= 2) {
      return "Thank you for your honest feedback. We will use your input to improve the session quality.";
    }
    return "Thank you for sharing your insights. Your feedback helps us create better learning resources.";
  }, [draft.rating]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg bg-aura text-white">
      <CursorGlow />
      <ThreeBackground />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* TOP HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-fade rounded-3xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">COMPESA Student Portal</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Session Feedback & Guidance</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Help us improve by sharing your insights on academic guidance sessions. Your feedback shapes better learning resources.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <MagneticButton
              onClick={() => setActivePanel("feedback")}
              className={activePanel === "feedback" ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-glow" : ""}
            >
              📝 Student Feedback
            </MagneticButton>

            <MagneticButton
              onClick={() => setActivePanel("contact")}
              className={activePanel === "contact" ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-glow" : ""}
            >
              📞 Contact Us
            </MagneticButton>

            <MagneticButton
              onClick={() => setActivePanel("admin")}
              className={activePanel === "admin" ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-glow" : ""}
            >
              🔒 Admin Control
            </MagneticButton>
          </div>
        </motion.header>

        {/* TAB 1: STUDENT FEEDBACK WIZARD */}
        {activePanel === "feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SessionSummary />

            {!submitted ? (
              <div className="hero-fade parallax-section">
                <SessionFeedbackWizard
                  draft={draft}
                  setDraft={setDraft}
                  onSubmitted={handleSubmitted}
                  click={sounds.click}
                  success={sounds.success}
                />
              </div>
            ) : (
              <section className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-emerald-300/35 bg-emerald-300/10 p-6"
                >
                  <h2 className="text-2xl font-semibold text-emerald-100">Thank you for your feedback! 🎉</h2>
                  <p className="mt-2 text-sm text-emerald-50">{thankYou}</p>
                  <div className="mt-4">
                    <MagneticButton onClick={resetFlow}>Submit Another Feedback</MagneticButton>
                  </div>
                </motion.div>
              </section>
            )}
          </motion.div>
        )}

        {/* TAB 2: STANDALONE CONTACT US SECTION */}
        {activePanel === "contact" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ContactUs onStartFeedback={() => setActivePanel("feedback")} />
          </motion.div>
        )}

        {/* TAB 3: ADMIN CONTROL CENTER */}
        {activePanel === "admin" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {!adminAuthenticated ? (
              <AdminLogin onLogin={handleAdminLogin} />
            ) : adminLoading ? (
              <section className="rounded-2xl border border-white/15 bg-panel p-6 text-center shadow-glass backdrop-blur-xl">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                <p className="mt-3 text-sm text-cyan-100">Loading feedback from Supabase...</p>
              </section>
            ) : adminError && !records.length ? (
              <section className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
                <p className="text-sm text-rose-200">{adminError}</p>
              </section>
            ) : (
              <div className="space-y-4">
                {adminError && (
                  <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 backdrop-blur-xl">
                    ℹ️ {adminError}
                  </div>
                )}
                <Suspense
                  fallback={
                    <section className="rounded-2xl border border-white/15 bg-panel p-6 text-center shadow-glass backdrop-blur-xl">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                      <p className="mt-3 text-sm text-cyan-100">Loading dashboard...</p>
                    </section>
                  }
                >
                  <AdminDashboard records={records} onLogout={handleAdminLogout} />
                </Suspense>
              </div>
            )}
          </motion.div>
        )}

        {showThanksPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-cyan-300/30 bg-slate-900/95 p-6 text-center shadow-glass backdrop-blur-xl">
              <p className="text-lg font-semibold text-cyan-100">
                Thank you for taking the time to share your feedback 🙌
              </p>
              <div className="mt-5">
                <MagneticButton onClick={() => setShowThanksPopup(false)}>Close</MagneticButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
