"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// load SiteHeader as a client-only dynamic import to avoid SSR issues
const SiteHeader = dynamic(() => import('./SiteHeader'), { ssr: false });

export default function ConditionalHeader() {
  const pathname = usePathname();
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  // hide on checkout and the previously hidden pages
  const hidePaths = ['/join', '/order-quantum-machine', '/shop/checkout', '/signin', '/quantum'];
  if (hidePaths.includes(path) || hidePaths.some(p => path.startsWith(p + '/'))) {
    return null;
  }
  return <SiteHeader />;
}
