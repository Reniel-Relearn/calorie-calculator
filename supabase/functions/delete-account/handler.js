const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://calorie-calculator-gamma-ten.vercel.app",
]);

const MAX_BODY_BYTES = 4096;
const MAX_AUTHORIZATION_BYTES = 8192;
const ALLOWED_BODY_FIELDS = new Set([
  "captchaToken",
  "confirmation",
  "currentPassword",
]);

function json(body, status, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function normalizedOrigins(rawOrigins) {
  const candidates = rawOrigins
    ? rawOrigins.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  return new Set(
    candidates.flatMap((origin) => {
      try {
        const parsed = new URL(origin);
        const localHttp =
          parsed.protocol === "http:" &&
          (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
        if (parsed.origin !== origin || (!localHttp && parsed.protocol !== "https:")) {
          return [];
        }
        return [parsed.origin];
      } catch {
        return [];
      }
    }),
  );
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

async function readBoundedBody(request, maxBytes = MAX_BODY_BYTES) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, code: "REQUEST_TOO_LARGE" };
  }

  if (!request.body) return { ok: false, code: "INVALID_REQUEST" };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteCount = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteCount += value.byteLength;
      if (byteCount > maxBytes) {
        await reader.cancel();
        return { ok: false, code: "REQUEST_TOO_LARGE" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch {
    return { ok: false, code: "INVALID_REQUEST" };
  }

  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, code: "INVALID_REQUEST" };
  }
}

function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "INVALID_REQUEST";
  }
  if (Object.keys(body).some((key) => !ALLOWED_BODY_FIELDS.has(key))) {
    return "INVALID_REQUEST";
  }
  if (body.confirmation !== "DELETE") return "CONFIRMATION_REQUIRED";
  if (
    typeof body.currentPassword !== "string" ||
    body.currentPassword.length < 8 ||
    body.currentPassword.length > 1024
  ) {
    return "CURRENT_PASSWORD_REQUIRED";
  }
  if (
    typeof body.captchaToken !== "string" ||
    body.captchaToken.length === 0 ||
    body.captchaToken.length > 2048
  ) {
    return "CAPTCHA_REQUIRED";
  }
  return null;
}

function parseThrottle(data) {
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.allowed !== "boolean" ||
    !Number.isInteger(data.retryAfterSeconds) ||
    data.retryAfterSeconds < 0
  ) {
    return null;
  }
  return data;
}

export function createDeleteAccountHandler({ createClient, getEnv }) {
  return async function handleDeleteAccount(request) {
    const allowedOrigins = normalizedOrigins(getEnv("ALLOWED_ORIGINS"));
    const origin = request.headers.get("origin");
    if (!origin || !allowedOrigins.has(origin)) {
      return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
    }
    const responseCors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...responseCors, "Cache-Control": "no-store" },
      });
    }
    if (request.method !== "POST") {
      return json({ code: "METHOD_NOT_ALLOWED" }, 405, {
        ...responseCors,
        Allow: "POST, OPTIONS",
      });
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return json({ code: "UNSUPPORTED_MEDIA_TYPE" }, 415, responseCors);
    }

    const authorization = request.headers.get("authorization");
    if (
      !authorization?.startsWith("Bearer ") ||
      new TextEncoder().encode(authorization).byteLength > MAX_AUTHORIZATION_BYTES
    ) {
      return json({ code: "AUTHENTICATION_REQUIRED" }, 401, responseCors);
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const publicKey = getEnv("SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_PUBLISHABLE_KEY");
    const privilegedKey =
      getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? getEnv("SUPABASE_SECRET_KEY");
    if (!supabaseUrl || !publicKey || !privilegedKey) {
      return json({ code: "ACCOUNT_DELETE_UNAVAILABLE" }, 503, responseCors);
    }

    const authenticatedClient = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user } = {},
      error: userError,
    } = await authenticatedClient.auth.getUser();
    if (userError || !user) {
      return json({ code: "AUTHENTICATION_REQUIRED" }, 401, responseCors);
    }

    const parsed = await readBoundedBody(request);
    if (!parsed.ok) {
      const status = parsed.code === "REQUEST_TOO_LARGE" ? 413 : 400;
      return json({ code: parsed.code }, status, responseCors);
    }
    const bodyError = validateBody(parsed.body);
    if (bodyError) return json({ code: bodyError }, 400, responseCors);

    const adminClient = createClient(supabaseUrl, privilegedKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: throttleData, error: throttleError } = await adminClient.rpc(
      "consume_account_delete_attempt",
      { p_user_id: user.id },
    );
    const throttle = parseThrottle(throttleData);
    if (throttleError || !throttle) {
      return json({ code: "ACCOUNT_DELETE_UNAVAILABLE" }, 503, responseCors);
    }
    if (!throttle.allowed) {
      return json({ code: "TOO_MANY_ATTEMPTS" }, 429, {
        ...responseCors,
        "Retry-After": String(Math.max(1, throttle.retryAfterSeconds)),
      });
    }

    const email = user.email;
    if (typeof email !== "string" || !email) {
      return json(
        { code: "PASSWORD_REAUTHENTICATION_UNAVAILABLE" },
        400,
        responseCors,
      );
    }

    const reauthenticationClient = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: reauthentication, error: reauthenticationError } =
      await reauthenticationClient.auth.signInWithPassword({
        email,
        password: parsed.body.currentPassword,
        options: { captchaToken: parsed.body.captchaToken },
      });
    if (
      reauthenticationError ||
      !reauthentication.user ||
      reauthentication.user.id !== user.id
    ) {
      return json({ code: "CURRENT_PASSWORD_INVALID" }, 403, responseCors);
    }

    const { error: deletionError } = await adminClient.auth.admin.deleteUser(
      user.id,
      false,
    );
    if (deletionError) {
      return json({ code: "ACCOUNT_DELETE_FAILED" }, 500, responseCors);
    }

    return json({ deleted: true }, 200, responseCors);
  };
}

export const deleteAccountSecurity = Object.freeze({
  DEFAULT_ALLOWED_ORIGINS,
  MAX_BODY_BYTES,
});
