import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  const { message } = (await req.json()) as { message: string };

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
  }

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a sentiment analyzer for product feedback. Return strict JSON with sentiment (Positive|Neutral|Negative), score between 0 and 1, summary, suggestions as 3 bullet strings, and thankYouMessage."
      },
      {
        role: "user",
        content: message
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

  const output = completion.output_text;

  return new Response(output, {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
