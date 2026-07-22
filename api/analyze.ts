import OpenAI from "openai";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  let message = "";
  try {
    const body = (await req.json()) as { message?: string };
    message = body.message || "";
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback Rule-Based Sentiment Analysis if OpenAI Key is absent
  if (!apiKey) {
    const text = message.toLowerCase();
    const positiveWords = ["great", "awesome", "good", "excellent", "love", "helpful", "amazing", "clear", "best"];
    const negativeWords = ["bad", "poor", "confusing", "boring", "hard", "difficult", "worst", "slow"];

    let score = 0.5;
    positiveWords.forEach((word) => {
      if (text.includes(word)) score += 0.1;
    });
    negativeWords.forEach((word) => {
      if (text.includes(word)) score -= 0.1;
    });
    score = Math.max(0.1, Math.min(0.99, score));

    const sentiment = score > 0.65 ? "Positive" : score < 0.4 ? "Negative" : "Neutral";
    const summary = message
      ? `Feedback highlighted key thoughts: "${message.slice(0, 80)}${message.length > 80 ? "..." : ""}"`
      : "Standard student response logged.";

    return new Response(
      JSON.stringify({
        sentiment,
        score,
        summary,
        suggestions: [
          "Incorporate more interactive live coding exercises.",
          "Provide step-by-step documentation handouts after sessions.",
          "Allocate additional time for Q&A and student troubleshooting."
        ],
        thankYouMessage: "Thank you for sharing your thoughts! We value your feedback."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // AI Sentiment Analysis via OpenAI
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a sentiment analyzer for student feedback. Return strict JSON with sentiment (Positive|Neutral|Negative), score between 0 and 1, summary, suggestions as 3 bullet strings, and thankYouMessage."
        },
        {
          role: "user",
          content: message || "Good session."
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "feedback_analysis",
          schema: {
            type: "object",
            properties: {
              sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative"] },
              score: { type: "number" },
              summary: { type: "string" },
              suggestions: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3
              },
              thankYouMessage: { type: "string" }
            },
            required: ["sentiment", "score", "summary", "suggestions", "thankYouMessage"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    return new Response(completion.output_text, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "OpenAI analysis failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
