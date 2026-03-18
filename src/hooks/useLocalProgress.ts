import { useEffect, useState } from "react";
import type { FeedbackInput } from "../types";

const STORAGE_KEY = "premium_feedback_progress_v1";

const defaultDraft: FeedbackInput = {
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
};

export function useLocalProgress() {
  const [draft, setDraft] = useState<FeedbackInput>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultDraft;
    }

    try {
      return { ...defaultDraft, ...JSON.parse(saved) } as FeedbackInput;
    } catch {
      return defaultDraft;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const clearDraft = () => localStorage.removeItem(STORAGE_KEY);

  return {
    draft,
    setDraft,
    clearDraft
  };
}
