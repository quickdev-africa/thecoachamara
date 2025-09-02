// Lightweight admin fetch wrapper: automatically include credentials for same-origin requests
// This runs in the client only and is imported by `src/app/admin/layout.tsx`.

if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch.bind(window);
  // avoid double-wrapping
  if (!(originalFetch as any).__adminWrapped) {
    const wrapped = (input: RequestInfo, init?: RequestInit) => {
      // If request is same-origin and credentials not set, add same-origin
      try {
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
        const isSameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
        const cfg: RequestInit = { ...(init || {}) };
        if (isSameOrigin) {
          if (!cfg.credentials) cfg.credentials = 'same-origin';
        }
        return originalFetch(input, cfg);
      } catch (err) {
        return originalFetch(input, init);
      }
    };
    (wrapped as any).__adminWrapped = true;
    (window as any).fetch = wrapped;
  }
}
