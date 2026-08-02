# Task 6 — Human Interview Marketplace API Routes

**Agent**: fullstack-developer
**Status**: Completed

## Summary

Created 6 API route files for the human interview marketplace. All routes follow the existing `NextRequest`/`NextResponse` pattern, attempt DB access via dynamic `import('@/lib/db')` wrapped in try/catch, and fall back to rich mock data when the database is unavailable.

## Files Created

| File | Method | Description |
|------|--------|-------------|
| `src/app/api/interviewers/apply/route.ts` | POST | Multipart FormData application with validation |
| `src/app/api/interviewers/route.ts` | GET | List 12 approved interviewers, filterable, paginated |
| `src/app/api/interviewers/[id]/route.ts` | GET | Single profile with reviews + availability slots |
| `src/app/api/admin/interviewers/route.ts` | GET | Admin list with status filter |
| `src/app/api/admin/interviewers/[id]/approve/route.ts` | POST | Approve interviewer |
| `src/app/api/admin/interviewers/[id]/reject/route.ts` | POST | Reject interviewer with optional reason |

## Key Decisions

- All error responses use `{ error: { ar: '...', en: '...' } }` bilingual format
- Mock data includes 12 interviewers with Arabic names, diverse specialties, 3 price tiers, ratings 4.2–5.0
- Each interviewer profile includes 3 bilingual reviews and weekly availability slots
- Admin list includes PENDING (3), REJECTED (2), SUSPENDED (1) entries alongside approved ones
- ESLint passed with zero errors
