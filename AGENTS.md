# Project instructions

Read docs/CONVO2POC_MASTER_SPEC.md fully; it is the source of truth.
Implement only the explicitly authorized phase. Phases 1, 2 and 3 are complete; Phase 4 needs explicit user approval. Preserve the approved Overview. Phase 3 captures ambiguity and later conversation responses. The priority answer may confirm BR-001 and FR-007 in Live Session; formal clarification review remains unresolved.
Preserve strict TypeScript, accessible UI, reduced motion, and shared design tokens.
Keep domain data separate from UI and use one coherent Zustand demo store.
Use deterministic simulations. No backend, real authentication, LLM calls, API keys, or production integrations without explicit authorization.
Typed canonical mock data is the source of truth for scenario content and metrics; illustrative specification counts must not override it. Future feedback expands approval from P1-only to P1 and P2. Keep requirement IDs, transcript evidence, scope, artifacts, and traceability consistent. Derive counts from data; do not invent business claims.
Use reusable components and typed simulation events. Human approval gates must precede generation and version changes.
Test critical state transitions and data integrity. Run typecheck, lint, tests, and build after changes.
Do not implement later phases as part of foundation maintenance.
