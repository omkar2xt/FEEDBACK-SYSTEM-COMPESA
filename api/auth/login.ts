export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username || "").trim();
    const password = body.password || "";

    const validUsername = process.env.ADMIN_USERNAME || "admincse";
    const validPassword = process.env.ADMIN_PASSWORD || "cseadmin123@";

    if (username === validUsername && password === validPassword) {
      const sessionToken = Buffer.from(`${username}:${Date.now()}:compesa-secret-session`).toString("base64");
      return new Response(
        JSON.stringify({
          success: true,
          token: sessionToken,
          message: "Authentication successful"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid username or password"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
