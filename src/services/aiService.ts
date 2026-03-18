import type { AnalysisResult, SentimentLabel } from "../types";

const endpoint = import.meta.env.VITE_OPENAI_PROXY_ENDPOINT || "/api/analyze";

function heuristicSentiment(input: string): SentimentLabel {
  const lower = input.toLowerCase();
  const positiveWords = ["great", "love", "excellent", "smooth", "fast", "awesome"];
  const negativeWords = ["bad", "slow", "hate", "bug", "issue", "lag", "problem"];

  const pos = positiveWords.filter((word) => lower.includes(word)).length;
  const neg = negativeWords.filter((word) => lower.includes(word)).length;

  if (neg > pos) return "Negative";
  if (pos > neg) return "Positive";
  return "Neutral";
}

export async function analyzeFeedback(message: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("AI API request failed");
    }

    return (await response.json()) as AnalysisResult;
  } catch {
    const sentiment = heuristicSentiment(message);
    return {
      sentiment,
      score: sentiment === "Positive" ? 0.85 : sentiment === "Negative" ? 0.28 : 0.55,
      summary: "AI endpoint unavailable. This fallback summary is based on local sentiment rules.",
      suggestions: [
        "Add one specific example to make your feedback more actionable.",
        "Mention the exact feature where you felt friction.",
        "Include your expected outcome for clearer product improvements."
      ],
      thankYouMessage:
        sentiment === "Positive"
          ? "Thank you for the uplifting feedback. We are excited to build on what you love."
          : sentiment === "Negative"
            ? "Thank you for the candid note. Your details help us improve quickly and meaningfully."
            : "Thanks for the balanced feedback. Your input helps us tune the experience."
    };
  }
}
