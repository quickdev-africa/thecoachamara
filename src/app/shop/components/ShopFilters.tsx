import React from 'react';
import SidebarFilters from './SidebarFilters';

// Simple compatibility wrapper named `ShopFilters.tsx` so external
// code expecting that filename will find it. It intentionally does
// nothing more than re-export the existing SidebarFilters component.

export default function ShopFilters(props: any) {
  return <SidebarFilters {...props} />;
}
