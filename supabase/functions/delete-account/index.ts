import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: corsHeaders });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return json({ code: "METHOD_NOT_ALLOWED" }, 405);
    }

    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publicKey =
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const privilegedKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SECRET_KEY");
    if (!supabaseUrl || !publicKey || !privilegedKey) {
      return json({ code: "ACCOUNT_DELETE_UNAVAILABLE" }, 503);
    }
    if (!authorization?.startsWith("Bearer ")) {
      return json({ code: "AUTHENTICATION_REQUIRED" }, 401);
    }

    const authenticatedClient = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: userError,
    } = await authenticatedClient.auth.getUser();
    if (userError || !user) {
      return json({ code: "AUTHENTICATION_REQUIRED" }, 401);
    }

    let body: { confirmation?: unknown; currentPassword?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ code: "INVALID_REQUEST" }, 400);
    }

    if (body.confirmation !== "DELETE") {
      return json({ code: "CONFIRMATION_REQUIRED" }, 400);
    }
    if (
      typeof body.currentPassword !== "string" ||
      body.currentPassword.length === 0 ||
      body.currentPassword.length > 1024
    ) {
      return json({ code: "CURRENT_PASSWORD_REQUIRED" }, 400);
    }

    const userId = user.id;
    const email = user.email;
    if (typeof email !== "string" || !email) {
      return json({ code: "PASSWORD_REAUTHENTICATION_UNAVAILABLE" }, 400);
    }

    const reauthenticationClient = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: reauthentication, error: reauthenticationError } =
      await reauthenticationClient.auth.signInWithPassword({
        email,
        password: body.currentPassword,
      });
    if (
      reauthenticationError ||
      !reauthentication.user ||
      reauthentication.user.id !== userId
    ) {
      return json({ code: "CURRENT_PASSWORD_INVALID" }, 403);
    }

    const adminClient = createClient(supabaseUrl, privilegedKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: deletionError } = await adminClient.auth.admin.deleteUser(
      userId,
      false,
    );
    if (deletionError) {
      return json({ code: "ACCOUNT_DELETE_FAILED" }, 500);
    }

    return json({ deleted: true }, 200);
  },
};
