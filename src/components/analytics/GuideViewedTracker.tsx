'use client';

import { useEffect, useRef } from 'react';
import { trackGuideViewed } from '@/lib/analytics-ga';

export function GuideViewedTracker({
  guideType,
  guideSlug,
  locale,
}: {
  guideType: 'company' | 'role';
  guideSlug: string;
  locale: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackGuideViewed({ guideType, guideSlug, locale });
  }, [guideType, guideSlug, locale]);

  return null;
}
