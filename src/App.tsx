import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CursorGlow } from "./components/CursorGlow";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { SessionFeedbackWizard } from "./components/SessionFeedbackWizard";
import { SessionSummary } from "./components/SessionSummary";
import { MagneticButton } from "./components/MagneticButton";
import { ThreeBackground } from "./components/ThreeBackground";
import { useLocalProgress } from "./hooks/useLocalProgress";
import { useSound } from "./hooks/useSound";
import { fetchFeedback, subscribeFeedbackRealtime } from "./services/feedbackService";
import type { FeedbackRecord } from "./types";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activePanel, setActivePanel] = useState<"user" | "admin">("user");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showThanksPopup, setShowThanksPopup] = useState(false);
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const { draft, setDraft, clearDraft } = useLocalProgress();
  const sounds = useSound();

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

  const handleAdminLogin = (username: string, password: string) => {
    const ok = username === "admin" && password === "admincse123";
    setAdminAuthenticated(ok);
    return ok;
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
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-fade rounded-3xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">First Year Programming Session</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Session Feedback Journey</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Help us improve by sharing your insights on this first-year programming guidance session. Your feedback shapes better resources for students like you.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <MagneticButton onClick={() => setActivePanel("user")}>User Panel</MagneticButton>
            <MagneticButton onClick={() => setActivePanel("admin")}>Admin Panel</MagneticButton>
          </div>

        </motion.header>

        {activePanel === "user" && (
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

        {activePanel === "admin" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {!adminAuthenticated ? (
              <AdminLogin onLogin={handleAdminLogin} />
            ) : adminLoading ? (
              <section className="rounded-2xl border border-white/15 bg-panel p-6 text-center shadow-glass backdrop-blur-xl">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                <p className="mt-3 text-sm text-cyan-100">Loading feedback from Firebase...</p>
              </section>
            ) : adminError ? (
              <section className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
                <p className="text-sm text-rose-200">{adminError}</p>
              </section>
            ) : (
              <AdminDashboard records={records} onLogout={() => setAdminAuthenticated(false)} />
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
