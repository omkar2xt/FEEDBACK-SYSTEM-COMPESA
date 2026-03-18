import type { RealtimeChannel } from "@supabase/supabase-js";
import type { FeedbackRecord } from "../types";
import { supabase } from "./supabase";
const RETRY_QUEUE_KEY = "feedback_retry_queue_v1";

type Unsubscribe = () => void;

interface FeedbackRow {
  id: string;
  name: string;
  email: string;
  mood: FeedbackRecord["mood"];
  rating: number;
  category: FeedbackRecord["category"];
  message: string;
  would_recommend: boolean;
  follow_up: string | null;
  overall_experience: FeedbackRecord["overallExperience"];
  learning_outcome: FeedbackRecord["learningOutcome"];
  most_useful_topic: FeedbackRecord["mostUsefulTopic"];
  clarity: FeedbackRecord["clarity"];
  engagement: FeedbackRecord["engagement"];
  speaker_support: FeedbackRecord["speakerSupport"];
  impact_plan: FeedbackRecord["impactPlan"];
  impact_plans: FeedbackRecord["impactPlans"] | null;
  recommendation: FeedbackRecord["recommendation"];
  suggestions: string | null;
  sentiment: FeedbackRecord["sentiment"];
  sentiment_score: number;
  summary: string;
  created_at_client: number | null;
  created_at: string;
}

function readRetryQueue(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem(RETRY_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FeedbackRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRetryQueue(records: FeedbackRecord[]) {
  if (!records.length) {
    localStorage.removeItem(RETRY_QUEUE_KEY);
    return;
  }
  localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(records));
}

function enqueueForRetry(record: FeedbackRecord) {
  const queued = readRetryQueue();
  const key = record.id || String(record.createdAt);
  const filtered = queued.filter((item) => (item.id || String(item.createdAt)) !== key);
  filtered.push(record);
  writeRetryQueue(filtered);
}

function normalizeRecord(row: FeedbackRow): FeedbackRecord {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    mood: row.mood || "neutral",
    rating: row.rating || 0,
    category: row.category || "UX",
    message: row.message || "",
    wouldRecommend: Boolean(row.would_recommend),
    followUp: row.follow_up || "",
    overallExperience: row.overall_experience || "Good",
    learningOutcome: row.learning_outcome || "Some useful things",
    mostUsefulTopic: row.most_useful_topic || "Mini Projects",
    clarity: row.clarity || "Somewhat clear",
    engagement: row.engagement || "Okay",
    speakerSupport: row.speaker_support || "Good",
    impactPlan: row.impact_plan || "Improving skills",
    impactPlans: Array.isArray(row.impact_plans) ? row.impact_plans : [row.impact_plan || "Improving skills"],
    recommendation: row.recommendation || "Yes",
    suggestions: row.suggestions || "",
    sentiment: row.sentiment || "Neutral",
    sentimentScore: row.sentiment_score || 0.5,
    summary: row.summary || "",
    createdAt: row.created_at_client || Date.parse(row.created_at) || Date.now()
  };
}

export async function saveFeedback(record: FeedbackRecord) {
  const fallbackId = `${record.createdAt}-${Math.abs(record.name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0))}`;
  const docId = record.id || fallbackId;

  const payload = {
    id: docId,
    name: record.name,
    email: record.email,
    mood: record.mood,
    rating: record.rating,
    category: record.category,
    message: record.message,
    would_recommend: record.wouldRecommend,
    follow_up: record.followUp || null,
    overall_experience: record.overallExperience,
    learning_outcome: record.learningOutcome,
    most_useful_topic: record.mostUsefulTopic,
    clarity: record.clarity,
    engagement: record.engagement,
    speaker_support: record.speakerSupport,
    impact_plan: record.impactPlan,
    impact_plans: record.impactPlans,
    recommendation: record.recommendation,
    suggestions: record.suggestions || null,
    sentiment: record.sentiment,
    sentiment_score: record.sentimentScore,
    summary: record.summary,
    created_at_client: record.createdAt
  };

  const { error } = await supabase.from("feedback").upsert(payload, { onConflict: "id" });
  if (error) {
    throw error;
  }
}

export async function saveFeedbackDeferred(record: FeedbackRecord, timeoutMs = 3500): Promise<"saved" | "queued"> {
  // Keep UX fast: if write fails or exceeds timeout, queue locally and sync later.
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("submit-timeout")), timeoutMs);
  });

  try {
    await Promise.race([saveFeedback(record), timeout]);
    return "saved";
  } catch {
    enqueueForRetry(record);
    return "queued";
  }
}

export async function flushQueuedFeedback() {
  const queued = readRetryQueue();
  if (!queued.length) return;

  const remaining: FeedbackRecord[] = [];
  for (const record of queued) {
    try {
      await saveFeedback(record);
    } catch {
      remaining.push(record);
    }
  }

  writeRetryQueue(remaining);
}

export async function fetchFeedback(): Promise<FeedbackRecord[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((row) => normalizeRecord(row as FeedbackRow));
}

export function subscribeFeedbackRealtime(
  callback: (records: FeedbackRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  let channel: RealtimeChannel | null = null;

  const load = async () => {
    try {
      callback(await fetchFeedback());
    } catch (error) {
      onError?.(error as Error);
    }
  };

  void load();

  channel = supabase
    .channel("feedback-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "feedback" }, () => {
      void load();
    })
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        onError?.(new Error("Supabase realtime channel error."));
      }
    });

  return () => {
    if (channel) {
      void supabase.removeChannel(channel);
    }
  };
}
