import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from "firebase/firestore";
import type { FeedbackRecord } from "../types";
import { db } from "./firebase";

const feedbackCollection = collection(db, "feedback");

function normalizeRecord(doc: QueryDocumentSnapshot<DocumentData>): FeedbackRecord {
  const data = doc.data();
  const createdAtMillis =
    data.createdAt?.toMillis?.() ||
    (typeof data.createdAt?.seconds === "number" ? data.createdAt.seconds * 1000 : undefined) ||
    data.createdAtClient ||
    Date.now();

  return {
    id: doc.id,
    name: data.name || "",
    email: data.email || "",
    mood: data.mood || "neutral",
    rating: data.rating || 0,
    category: data.category || "UX",
    message: data.message || "",
    wouldRecommend: Boolean(data.wouldRecommend),
    followUp: data.followUp || "",
    overallExperience: data.overallExperience || "Good",
    learningOutcome: data.learningOutcome || "Some useful things",
    mostUsefulTopic: data.mostUsefulTopic || "Mini Projects",
    clarity: data.clarity || "Somewhat clear",
    engagement: data.engagement || "Okay",
    speakerSupport: data.speakerSupport || "Good",
    impactPlan: data.impactPlan || "Improving skills",
    impactPlans: Array.isArray(data.impactPlans) ? data.impactPlans : [data.impactPlan || "Improving skills"],
    recommendation: data.recommendation || "Yes",
    suggestions: data.suggestions || "",
    sentiment: data.sentiment || "Neutral",
    sentimentScore: data.sentimentScore || 0.5,
    summary: data.summary || "",
    createdAt: createdAtMillis
  };
}

export async function saveFeedback(record: FeedbackRecord) {
  await addDoc(feedbackCollection, {
    ...record,
    createdAtClient: record.createdAt,
    createdAt: serverTimestamp()
  });
}

export async function fetchFeedback(): Promise<FeedbackRecord[]> {
  const q = query(feedbackCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(normalizeRecord);
}

export function subscribeFeedbackRealtime(
  callback: (records: FeedbackRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(feedbackCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(normalizeRecord));
    },
    (error) => {
      onError?.(error);
    }
  );
}
