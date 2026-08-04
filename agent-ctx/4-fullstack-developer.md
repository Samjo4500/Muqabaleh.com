# Task 4 — Join-as-Interviewer Landing Page

## Agent: fullstack-developer

## Summary
Replaced the existing form-based `/join-as-interviewer/page.tsx` with a marketing landing page containing Hero, How It Works, Requirements, Earnings Calculator, CTA, and FAQ sections. All sections use the `joinInterviewer` i18n namespace. ESLint passed with zero errors.

## Files Modified
- `/src/app/[locale]/join-as-interviewer/page.tsx` — complete rewrite

## Key Decisions
- Used framer-motion stagger animation only on the How It Works cards (as specified)
- Slider uses native `<input type="range">` with `accent-[#d4af37]` for gold styling
- Earnings calc: sessions × $29 × 4 = gross, 20% fee, net = gross × 0.8
- FAQ uses shadcn Accordion with transparent background and gold-tinted borders
