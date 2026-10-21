import { createClient } from "npm:@supabase/supabase-js@2";
import { createDeleteAccountHandler } from "./handler.js";

export default {
  fetch: createDeleteAccountHandler({
    createClient,
    getEnv: (name: string) => Deno.env.get(name),
  }),
};
