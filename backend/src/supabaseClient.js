import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

// Prefer service role for inserts/updates; fall back to anon if necessary.
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) is required");
}

export const supabase = createClient(SUPABASE_URL, supabaseKey);
