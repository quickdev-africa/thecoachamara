import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Prefer the platform global fetch (Node 18+, deno, or browser) so
// @supabase/supabase-js doesn't bundle its node-fetch variant which
// pulls `whatwg-url` -> `punycode` and triggers DEP0040.
// If globalThis.fetch is not available (older Node), fall back to undici.
let platformFetch: typeof fetch | undefined = (globalThis as any).fetch;
try {
	if (!platformFetch) {
		// lazy require to avoid importing undici in environments that already have fetch
		// use eval('require') to prevent webpack from statically bundling node-only modules
		try {
			// eslint-disable-next-line no-eval
			const req = eval('require');
			const { fetch: undiciFetch } = req('undici');
			platformFetch = undiciFetch;
		} catch (e) {
			// undici not available or we're in a bundler context — leave undefined
		}
	}
} catch (e) {
	// If undici isn't installed and fetch isn't available, leave undefined;
	// supabase-js will fall back to its default which may bring node-fetch.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	// @ts-ignore - createClient accepts a `fetch` option in recent versions.
	fetch: platformFetch,
});