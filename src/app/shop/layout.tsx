import React from 'react';

// Shop-specific layout wrapper. Kept intentionally minimal so it doesn't
// interfere with existing pages/components. This file mirrors the
// provided structure and can be expanded later.

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shop-layout min-h-screen">
      {children}
    </div>
  );
}
