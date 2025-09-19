import { createClient } from '@supabase/supabase-js';

let cached: any = null;

function resolveFetch() {
  let platformFetch: typeof fetch | undefined = (globalThis as any).fetch;
  try {
    if (!platformFetch) {
      // eslint-disable-next-line no-eval
      const req = eval('require');
      const { fetch: undiciFetch } = req('undici');
      platformFetch = undiciFetch;
    }
  } catch {}
  return platformFetch;
}

export function getAnonSupabase() {
  if (cached) return cached;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  // If newer supabase-js supports custom fetch, we could pass it; omit for build safety.
  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}

// Backwards export (may be null) for existing imports
export const supabase = getAnonSupabase();
export default supabase;