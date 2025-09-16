import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAny: any;
if (url && serviceRole) {
	supabaseAny = createClient(url, serviceRole);
} else {
	// Export a stub that throws on use, to avoid crashing at import time in CI/preview builds
	supabaseAny = new Proxy({}, {
		get() {
			throw new Error('Supabase server client not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
		}
	});
}

export const serverSupabase = supabaseAny;

export default serverSupabase;
