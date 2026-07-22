import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url || "https://demo.supabase.co", key || "demo-key");
}

export default async function handler(req: Request): Promise<Response> {
  const method = req.method;

  // GET /api/years - Fetch all years
  if (method === "GET") {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("years")
        .select("*")
        .order("display_order", { ascending: true });

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
        JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // PATCH /api/years - Toggle year is_open (Admin)
  if (method === "PATCH") {
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const body = (await req.json()) as { id?: string; is_open?: boolean };
      if (!body.id || typeof body.is_open !== "boolean") {
        return new Response(JSON.stringify({ error: "id and is_open required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("years")
        .update({ is_open: body.is_open, updated_at: new Date().toISOString() })
        .eq("id", body.id)
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, data: data?.[0] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
