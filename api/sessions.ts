import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url || "https://demo.supabase.co", key || "demo-key");
}

export default async function handler(req: Request): Promise<Response> {
  const method = req.method;
  const url = new URL(req.url);
  const yearId = url.searchParams.get("year_id");
  const id = url.searchParams.get("id");

  const supabase = getSupabaseClient();

  // GET /api/sessions
  if (method === "GET") {
    try {
      let query = supabase.from("sessions").select("*").order("created_at", { ascending: false });
      if (yearId) {
        query = query.eq("year_id", yearId);
      }

      const { data, error } = await query;
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

  // Admin mutation endpoints require token check
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // POST /api/sessions - Create session
  if (method === "POST") {
    try {
      const body = await req.json();
      if (!body.year_id || !body.title) {
        return new Response(JSON.stringify({ error: "year_id and title are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const payload = {
        year_id: body.year_id,
        title: body.title,
        description: body.description || "",
        session_date: body.session_date || null,
        venue: body.venue || "",
        feedback_open: Boolean(body.feedback_open ?? true)
      };

      const { data, error } = await supabase.from("sessions").insert(payload).select();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, data: data?.[0] }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // PATCH /api/sessions - Update session
  if (method === "PATCH") {
    try {
      const body = await req.json();
      if (!body.id) {
        return new Response(JSON.stringify({ error: "Session id is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.session_date !== undefined) updateData.session_date = body.session_date;
      if (body.venue !== undefined) updateData.venue = body.venue;
      if (body.feedback_open !== undefined) updateData.feedback_open = Boolean(body.feedback_open);

      const { data, error } = await supabase.from("sessions").update(updateData).eq("id", body.id).select();
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

  // DELETE /api/sessions?id=...
  if (method === "DELETE") {
    try {
      if (!id) {
        return new Response(JSON.stringify({ error: "Session id query parameter required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
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
