'use client';

import { useEffect } from 'react';
import { captureAttributionFromLocation } from '@/lib/marketing/attribution';

/** Persist first-touch UTM / referrer on every locale page load. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);
  return null;
}
