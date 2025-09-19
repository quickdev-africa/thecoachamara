"use client";
import { useEffect } from 'react';
import { captureAttributionOnce } from '@/lib/attribution';

export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionOnce();
  }, []);
  return null;
}
