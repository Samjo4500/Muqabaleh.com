---
Task ID: 1
Agent: main
Task: Fix 10-question interview engine critical bugs

Work Log:
- Created /home/z/my-project/src/lib/demo-state.ts — shared in-memory demo state Map
- Fixed ai.ts:331 — replaced undefined DEMO_QUESTIONS_AR/EN with getDemoQuestionsForParams()
- Updated guest/interview/route.ts — imports demoInterviews from shared module
- Updated guest/[token]/messages/route.ts — imports demoInterviews from shared module
- Fixed off-by-one bug in messages route (Q2 was being skipped)
- Set DEMO_MODE=true in .env (no database available in sandbox)

Stage Summary:
- Interview engine was already complete (10 roles × 3 levels × 10 questions, Gulf Arabic, industry variants Q3/Q6/Q9)
- Fixed 3 critical bugs: undefined vars, duplicated Map, off-by-one index
- Verified full 10-question flow works: Q1 through Q10 with done=true
- Lint passes clean

