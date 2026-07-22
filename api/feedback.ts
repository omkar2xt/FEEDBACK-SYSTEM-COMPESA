import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error("Supabase credentials missing on server environment");
  }

  return createClient(url, key);
}

export default async function handler(req: Request): Promise<Response> {
  const method = req.method;

  // GET: Fetch all feedback records (Admin endpoint)
  if (method === "GET") {
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "");

      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing authentication token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, data: data || [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }

  // POST: Create or update feedback record
  if (method === "POST") {
    try {
      const body = await req.json();

      if (!body.name || !body.email) {
        return new Response(JSON.stringify({ error: "Name and email are required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const fallbackId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const payload = {
        id: body.id || fallbackId,
        name: body.name,
        email: body.email,
        mood: body.mood || "neutral",
        rating: body.rating ?? 5,
        category: body.category || "UX",
        message: body.message || "",
        would_recommend: Boolean(body.wouldRecommend ?? body.would_recommend),
        follow_up: body.followUp || body.follow_up || null,
        overall_experience: body.overallExperience || body.overall_experience || "Good",
        learning_outcome: body.learningOutcome || body.learning_outcome || "Some useful things",
        most_useful_topic: body.mostUsefulTopic || body.most_useful_topic || "Mini Projects",
        clarity: body.clarity || "Somewhat clear",
        engagement: body.engagement || "Okay",
        speaker_support: body.speakerSupport || body.speaker_support || "Good",
        impact_plan: body.impactPlan || body.impact_plan || "Improving skills",
        impact_plans: Array.isArray(body.impactPlans) ? body.impactPlans : [body.impactPlan || "Improving skills"],
        recommendation: body.recommendation || "Yes",
        suggestions: body.suggestions || null,
        sentiment: body.sentiment || "Neutral",
        sentiment_score: body.sentimentScore ?? body.sentiment_score ?? 0.5,
        summary: body.summary || "",
        created_at_client: body.createdAt || body.created_at_client || Date.now()
      };

      const supabase = getSupabaseClient();
      const { error } = await supabase.from("feedback").upsert(payload, { onConflict: "id" });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, id: payload.id }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
