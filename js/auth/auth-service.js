import { createAuthRedirectUrl } from "./auth-routes.js";

function failure(error) {
  return { ok: false, error };
}

function success(data = {}) {
  return { ok: true, ...data };
}

export function createAuthService(client, applicationOrigin, schedule = queueMicrotask) {
  const confirmationRedirect = createAuthRedirectUrl(
    applicationOrigin,
    "confirm",
  );
  const recoveryRedirect = createAuthRedirectUrl(applicationOrigin, "recovery");

  return Object.freeze({
    async restoreSession() {
      const sessionResult = await client.auth.getSession();
      if (sessionResult.error) return failure(sessionResult.error);

      const session = sessionResult.data.session;
      if (!session) return success({ session: null });

      const userResult = await client.auth.getUser();
      if (userResult.error || !userResult.data.user) {
        await client.auth.signOut({ scope: "local" });
        return failure(
          userResult.error ?? { code: "session_not_found" },
        );
      }

      return success({
        session: { ...session, user: userResult.data.user },
      });
    },

    async signUp(email, password) {
      const result = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: confirmationRedirect },
      });

      if (result.error) return failure(result.error);

      if (result.data.session) {
        await client.auth.signOut({ scope: "local" });
        return failure({ code: "CONFIRMATION_DISABLED" });
      }

      return success();
    },

    async signIn(email, password) {
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error) return failure(result.error);
      return success({ session: result.data.session });
    },

    async requestPasswordReset(email) {
      const result = await client.auth.resetPasswordForEmail(email, {
        redirectTo: recoveryRedirect,
      });
      if (result.error) return failure(result.error);
      return success();
    },

    async updatePassword(password) {
      const result = await client.auth.updateUser({ password });
      if (result.error) return failure(result.error);
      return success({ user: result.data.user });
    },

    async signOut() {
      const result = await client.auth.signOut({ scope: "local" });
      if (result.error) return failure(result.error);
      return success();
    },

    subscribe(listener) {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        schedule(() => listener(event, session));
      });
      return () => data.subscription.unsubscribe();
    },
  });
}

