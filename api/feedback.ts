import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url || "https://demo.supabase.co", key || "demo-key");
}

export default async function handler(req: Request): Promise<Response> {
  const method = req.method;
  const supabase = getSupabaseClient();

  // GET: Fetch feedback records
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

      const { data: respData } = await supabase
        .from("responses")
        .select("*")
        .order("submitted_at", { ascending: false });

      const results: any[] = [];

      if (respData && respData.length > 0) {
        const [yearsRes, sessionsRes, answersRes, questionsRes] = await Promise.all([
          supabase.from("years").select("id, code, label"),
          supabase.from("sessions").select("id, year_id, title"),
          supabase.from("answers").select("id, response_id, question_id, answer_value"),
          supabase.from("questions").select("id, label, question_type")
        ]);

        const yearsMap = new Map();
        (yearsRes.data || []).forEach((y: any) => {
          yearsMap.set(y.id, y);
          yearsMap.set(y.code, y);
          if (y.code) {
            yearsMap.set(y.code.toUpperCase(), y);
            yearsMap.set(y.code.toLowerCase(), y);
          }
        });

        yearsMap.set("year-fy", { code: "FY", label: "First Year" });
        yearsMap.set("year-sy", { code: "SY", label: "Second Year" });
        yearsMap.set("year-ty", { code: "TY", label: "Third Year" });
        yearsMap.set("year-btech", { code: "BTECH", label: "B.Tech" });

        const sessionsMap = new Map((sessionsRes.data || []).map((s: any) => [s.id, s]));
        const questionsMap = new Map((questionsRes.data || []).map((q: any) => [q.id, q]));

        const answersByResp = new Map<string, any[]>();
        (answersRes.data || []).forEach((ans: any) => {
          const list = answersByResp.get(ans.response_id) || [];
          list.push(ans);
          answersByResp.set(ans.response_id, list);
        });

        respData.forEach((row: any) => {
          let y = yearsMap.get(row.year_id);
          const s = sessionsMap.get(row.session_id);

          if (!y && s && s.year_id) {
            y = yearsMap.get(s.year_id);
          }

          const ansList = answersByResp.get(row.id) || [];
          const formattedMessage = ansList.map((a: any) => {
            const q = questionsMap.get(a.question_id);
            const val = typeof a.answer_value === "object" ? JSON.stringify(a.answer_value) : a.answer_value;
            return `${q?.label || 'Answer'}: ${val}`;
          }).join(" | ") || "Feedback submitted";

          let resolvedCode = y?.code;
          if (!resolvedCode && s?.title) {
            const title = s.title.toUpperCase();
            if (title.includes("SECOND YEAR") || title.includes("SY") || title.includes("DSA")) resolvedCode = "SY";
            else if (title.includes("THIRD YEAR") || title.includes("TY") || title.includes("SYSTEM DESIGN")) resolvedCode = "TY";
            else if (title.includes("B.TECH") || title.includes("BTECH") || title.includes("CAPSTONE")) resolvedCode = "BTECH";
            else if (title.includes("FIRST YEAR") || title.includes("FY")) resolvedCode = "FY";
          }
          if (!resolvedCode && formattedMessage) {
            const msg = formattedMessage.toUpperCase();
            if (msg.includes("DSA") || msg.includes("TREES & GRAPHS") || msg.includes("DYNAMIC PROGRAMMING") || msg.includes("COMPETITIVE CODING")) resolvedCode = "SY";
            else if (msg.includes("FULL STACK") || msg.includes("CLOUD") || msg.includes("SYSTEM ARCHITECTURE")) resolvedCode = "TY";
            else if (msg.includes("PLACEMENT") || msg.includes("CAPSTONE") || msg.includes("RESUME BUILDING")) resolvedCode = "BTECH";
          }
          if (!resolvedCode) {
            const yIdStr = (row.year_id || "").toString().toLowerCase();
            if (yIdStr.includes("sy")) resolvedCode = "SY";
            else if (yIdStr.includes("ty")) resolvedCode = "TY";
            else if (yIdStr.includes("btech")) resolvedCode = "BTECH";
            else resolvedCode = "FY";
          }

          results.push({
            id: row.id,
            name: row.student_name,
            studentName: row.student_name,
            division: row.division,
            rollNo: row.roll_no,
            yearId: row.year_id,
            yearCode: resolvedCode,
            yearLabel: y?.label || resolvedCode,
            sessionId: row.session_id,
            sessionTitle: s?.title || "Guidance Session",
            rating: row.overall_rating || 5,
            overallExperience: (row.overall_rating || 5) >= 4 ? "Excellent" : "Good",
            recommendation: row.recommendation || "Yes",
            sentiment: row.sentiment || "Neutral",
            message: formattedMessage,
            mostUsefulTopic: s?.title || "Guidance Session",
            createdAt: Date.parse(row.submitted_at) || Date.now()
          });
        });
      }

      // Legacy feedback table fallback
      const { data: legacyData } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (legacyData && legacyData.length > 0) {
        legacyData.forEach((row: any) => {
          results.push({
            id: row.id,
            name: row.name,
            email: row.email,
            mood: row.mood,
            rating: row.rating,
            category: row.category,
            message: row.message,
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
          });
        });
      }

      return new Response(JSON.stringify({ success: true, data: results }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // POST: Create feedback submission
  if (method === "POST") {
    try {
      const body = await req.json();

      if (body.yearId && body.sessionId && body.studentName) {
        let targetYearId = body.yearId;
        let targetYearCode = "FY";

        const { data: yearList } = await supabase.from("years").select("id, code, is_open");
        if (yearList && yearList.length > 0) {
          const rawCode = (body.yearId || "").replace(/^year-/i, "").toUpperCase();
          const matched = yearList.find((y: any) =>
            y.id === body.yearId ||
            y.code?.toUpperCase() === rawCode ||
            y.code?.toUpperCase() === body.yearId?.toUpperCase()
          ) || yearList.find((y: any) => y.code === "SY" && rawCode.includes("SY"))
            || yearList.find((y: any) => y.code === "TY" && rawCode.includes("TY"))
            || yearList.find((y: any) => y.code === "BTECH" && rawCode.includes("BTECH"))
            || yearList[0];

          if (matched) {
            if (!matched.is_open) {
              return new Response(
                JSON.stringify({ error: "Feedback is currently closed for this year" }),
                { status: 403, headers: { "Content-Type": "application/json" } }
              );
            }
            targetYearId = matched.id;
            targetYearCode = matched.code;
          }
        }

        let targetSessionId = body.sessionId;
        const { data: sessionList } = await supabase.from("sessions").select("id, year_id").eq("year_id", targetYearId);
        if (sessionList && sessionList.length > 0) {
          const matchedSess = sessionList.find((s: any) => s.id === body.sessionId) || sessionList[0];
          if (matchedSess) {
            targetSessionId = matchedSess.id;
          }
        }

        const overallRating = typeof body.overallRating === "number" ? body.overallRating : 5;
        const sentiment = overallRating >= 4 ? "Positive" : overallRating <= 2 ? "Negative" : "Neutral";

        const responsePayload = {
          session_id: targetSessionId,
          year_id: targetYearId,
          student_name: body.studentName,
          division: body.division || "A",
          roll_no: body.rollNo || "01",
          overall_rating: overallRating,
          recommendation: body.recommendation || "Yes",
          sentiment,
          submitted_at: new Date().toISOString()
        };

        const { data: resp, error: respErr } = await supabase
          .from("responses")
          .insert(responsePayload)
          .select()
          .single();

        if (respErr || !resp) {
          return new Response(JSON.stringify({ error: respErr?.message || "Failed to insert response" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        if (Array.isArray(body.answers) && body.answers.length > 0) {
          let { data: questionList } = await supabase
            .from("questions")
            .select("id, order_index, label")
            .eq("year_id", targetYearId)
            .order("order_index", { ascending: true });

          const qMapById = new Map((questionList || []).map((q: any) => [q.id, q.id]));
          const qListOrdered = (questionList || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

          const answerPayloads = body.answers
            .map((ans: any, idx: number) => {
              let realQId = qMapById.get(ans.questionId);
              if (!realQId && qListOrdered[idx]) realQId = qListOrdered[idx].id;
              if (!realQId && qListOrdered.length > 0) realQId = qListOrdered[0].id;
              return {
                response_id: resp.id,
                question_id: realQId,
                answer_value: ans.answerValue
              };
            })
            .filter((a: any) => Boolean(a.question_id));

          if (answerPayloads.length > 0) {
            await supabase.from("answers").insert(answerPayloads);
          }
        }

        return new Response(JSON.stringify({ success: true, id: resp.id }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      }

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
}
