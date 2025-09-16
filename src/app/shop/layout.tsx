import React from 'react';

// Shop layout. The CartProvider is provided at the app root in `src/app/layout.tsx`.
// Avoid wrapping the shop subtree again to ensure a single source of truth for cart state.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shop-layout min-h-screen">
      {children}
    </div>
  );
}
