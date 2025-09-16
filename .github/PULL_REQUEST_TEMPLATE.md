Title: Home tiles → clickable product links with hover

Summary
-------
Make the homepage four-column product band interactive:
- Wrap each tile with a link to `/shop/[id]`
- Add hover scale + soft overlay
- Ensure headline overlay doesn't intercept clicks

Changes
- src/app/page.tsx: add `next/link`, convert 4 image tiles to links, add hover classes, set foreground to `pointer-events-none`.

Verification
- Hover effects visible on desktop; tiles clickable on all viewports
- Navigates to product detail pages:
  - /shop/a0e22d4f-b4aa-4704-b5f2-5fd801b1ed88 (Machines)
  - /shop/0cd6d480-66ca-4e3c-9c8c-63a64f7fbb78 (Boxers)
  - /shop/2bb424e2-fc60-4598-aefa-975b79f579b7 (Eyeglasses)
  - /shop/c62a94d2-a5f4-4d40-a65e-3a81550a8a6a (Bracelets)

Notes
- Cleared `.next` and restarted dev to avoid stale webpack chunk error.
- No server/API changes.
