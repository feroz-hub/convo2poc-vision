# Convo2POC Vision

**Conversation → Clarity → Working Prototype**

Convo2POC is an enterprise-governed Conversation-to-POC concept for presales and consulting teams. This interactive vision prototype will demonstrate structured requirements, clarification, scope approval, controlled generation, validation, traceability, and a reviewed client feedback loop.

The [master specification](docs/CONVO2POC_MASTER_SPEC.md) defines the product and phase boundaries. The canonical typed catalogs in `src/data/` are the single source of truth for scenario content and counts, following the approved corrections. **Phases 1–5 and Phase 5.5 Requirement Intelligence are implemented within their authorized workspaces.** `/` is the approved Executive Command Center, `/session` is the simulated Live Client Session, `/clarifications` is the governed evidence-review workspace, and `/scope` is the POC Scope Studio. `/requirements` is the structured requirement model and evidence inspector. The five later-phase product routes remain labeled placeholders. Phase 6 requires explicit approval.

## Getting started

Use Node.js 22.12 or newer (Node 22.23.2 was used for validation) and npm.

```bash
npm ci
npm run dev
```

Vite prints the local development URL. For a production preview:

```bash
npm run build
npm run preview
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run format:check
```

`npm run test:watch` runs Vitest interactively. `npm run format` formats project files while preserving the master specification. Tests cover store initialization and reset, canonical data references, traceability integrity, all routes, navigation, shell controls, and navigation focus handling, plus Overview content, workflow stages, Start Demo reset/navigation, Explore Workflow focus and reduced motion, metric derivation against changed and empty catalogs, and approval-expansion feedback integrity. Later-phase behavior tests are deferred with their implementations.

## Stack

React, strict TypeScript, Vite, Tailwind CSS with its Vite plugin, shadcn/ui, React Router, Zustand, Framer Motion, Lucide React, XYFlow, Recharts, Vitest, React Testing Library, ESLint, and Prettier. Installed versions are recorded in `package.json` and pinned by `package-lock.json`.

The Overview, Live Session, Clarification Center, Scope Studio and Requirement Intelligence routes are lazy-loaded to keep its motion and presentation code separate from the foundation bundle. The Overview uses an evidence transformation panel, connected workflow ribbon, catalog-derived telemetry, five differentiation modules, and a conceptual process comparison. Start Demo resets the entire store and navigates to `/session` without starting playback. Explore Workflow scrolls to and focuses the journey; reduced motion disables smooth scrolling and entrance motion.

The shadcn Button is local source in `src/components/ui`; `components.json` and the `@/` alias support adding components later. Semantic CSS tokens define intentionally designed light and dark themes: royal blue, cool white/pale blue surfaces in light mode, navy/blue-charcoal surfaces in dark mode, and restrained cyan/violet accents. The header uses an HCLTech typographic brand area and explicitly labels the experience “Internal Concept Prototype,” not an approved production product. The accessible theme switch stores a local presentation preference independently of demo state; dark remains the default, and the saved preference applies before paint. No official logo asset or remote brand dependency is introduced. Framer Motion's provider respects the user's reduced-motion preference. XYFlow and Recharts are installed for future phases and are not imported into the initial bundle.

## Architecture

- `src/app/`: shared route metadata, router, and providers.
- `src/components/shell/`: responsive navigation, engagement top bar, and demo controls.
- `src/components/common/` and `src/components/ui/`: reusable presentation primitives.
- `src/pages/`: approved Overview, Live Session, Clarification Center, Scope Studio, Requirement Intelligence and explicitly labeled phase placeholders.
- `src/components/clarifications/`: queue, five-stage evidence workspace, consultant approval actions and impact/history panel.
- `src/components/requirements/`: structured model visual, shared readiness breakdown, filtered catalog, evidence and relationship inspector.
- `src/store/requirementSelectors.ts`: status, capture, canonical relationship, filtering and model quality selectors.
- `src/components/scope/`: scope funnel, decision board, evidence inspector, success contract and consultant approval gate.
- `src/store/scopeSelectors.ts`: derived decisions, complexity, review coverage and generation readiness.
- `src/types/domain.ts`: requirements, transcript, scope, agents, validation, artifact graph, feedback, and version types.
- `src/data/`: canonical local scenario catalogs. Product records stay out of JSX.
- `src/store/demoStore.ts`: one in-memory Zustand store and a fresh-state factory.
- `src/simulation/`: typed event contracts, Phase 3 schedule, pure reducer, global clock and shared illustrative readiness model.
- `src/styles/`: theme and responsive shell styling.
- `src/tests/`: foundation, Overview, Live Session, clarification governance and scope approval state, timing, data-integrity, navigation, scroll and accessibility tests.

No authentication, backend, storage service, LLM, API key, remote font, or runtime network call is required. The built application works offline when served locally. A future SPA host must serve `index.html` for deep links.

## Planned demo storyline

A fictional Acme Enterprise Services workshop covers Service Request Management Modernization. Conversation signals become requirements; questions clarify priority and assignment authority; an approved scope creates a baseline; simulated agents generate and validate a prototype; evidence links back to the conversation; reviewed feedback produces POC v2; a value report concludes the demo.

## Simulation and state

Phase 3 uses a deterministic, typed event schedule in `src/simulation/sessionEvents.ts` and a pure reducer in `demoEngine.ts`. The shell attaches one 100 ms clock to the global Zustand store, with cleanup on unmount. Pause blocks clock advances; Resume continues from the same elapsed time; Next Event advances to the next timestamp and applies all events at that timestamp atomically. Restart resets and starts playback; Reset restores the idle canonical initial state. Navigation does not create additional clocks or reset progress. The internal demoSpeed multiplier remains bounded to 0.25–4.

The full 16-message canonical transcript plays in 80 seconds at default speed. Turns begin at 2 seconds and are spaced 4.8 seconds apart. Requirement detections follow their source by 0.9 seconds, actors by 1.2 seconds, clarification signals by 1.5 seconds and explicit-statement confirmations by 1.8 seconds. Speaking activity lasts 3.2 seconds per turn. Canonical workshop timestamps remain visible separately from elapsed demo time. Five scenario-brief records arrive in the first 1.1 seconds and are clearly labeled as brief evidence, rather than spoken claims. Requirements, confidence, sources, actor names and questions are referenced from the canonical catalogs; no copies of requirement content live in UI files.

Live state adds visible insight IDs, actors, assumptions, confirmed IDs, active speaker, transcript position, event cursor, readiness and session completion. Counters derive from visible canonical records: Requirements includes functional and non-functional records; rules, assumptions and open questions have separate counters. At completion these are 10 requirements, 7 confirmed requirements, 4 business rules, 4 actors, 3 assumptions and 3 open clarification questions. Confirmation means an explicit client statement, not human approval. The explicitly authorized priority answer confirms BR-001 and FR-007 during Live Session playback, after their detection events. BR-003 and the other question-dependent records remain unconfirmed; OQ-001 stays open for formal Phase 4 review.

The single shared illustrative readiness formula in `readiness.ts` weights business-problem capture (25%), actor coverage (15%), functional coverage (30%), business-rule coverage (15%), brief coverage (5%), and reviewed clarification coverage (10%). Coverage denominators come from canonical catalogs. Readiness starts at 0% and ends at 90% because all clarification reviews remain pending. The priority answer is displayed in the ambiguity card with BR-001 / FR-007 confirmation and increased readiness; no clarification resolution, scope approval, generation or version change is implemented in Phase 3.

The initial store is idle with no visible transcript, detected requirements, approvals, or baseline. POC version starts at v1 as a label, not a generated result. All agents and build checks wait. Reset creates fresh arrays and records and preserves store actions. Demo speed accepts values from 0.25 to 4.

Playback controls are enabled on `/session`; Settings and playback on later-phase placeholders remain disabled. Reset works without page refresh and does not change the current route. Sidebar navigation remains available regardless of demo state. Smaller screens use a keyboard-accessible navigation drawer with focus containment and Escape dismissal.

## Phase 4 clarification governance

`/clarifications` uses the three immutable canonical questions and their exact transcript sources/answers. Direct navigation exposes the recorded workshop evidence for inspection without starting or advancing Live Session. Queue status derives from playback capture and consultant actions: Open → Evidence Captured → Needs Review → Confirmed. Consultant rejection and reopening return the item to Open. The queue supports All, Open, Needs Review and Resolved; Needs Review includes captured answers awaiting inspection, and Resolved includes consultant-confirmed records.

The existing Zustand store owns selection, filter, saved local question edits, accepted suggestions, reviewed evidence, rejected/reopened IDs, resolved IDs and deterministic history entries. Accept Resolution requires Review Evidence first. Reopening removes the consultant approval and its readiness contribution while preserving the earlier live transcript confirmations. `selectGovernedRequirementIds` overlays consultant-confirmed canonical outputs on the independently captured live confirmations. No immutable catalog is rewritten. Phase 4 actions do not approve scope, create a baseline, start generation or change versions.

The priority answer's 56% → 71% capture uplift is derived by replaying canonical events into an isolated snapshot using the same readiness reducer. Consultant review contributes separately to the existing 10% clarification weight: after complete capture, OQ-001 approval increases current readiness from 90% to 93%, and approving all three reaches 100%. Round-to-integer increments can be 3 or 4 points. Readiness impact cards show both capture context and the current review projection; they never substitute a fixed score for global state.

Live Session's Review Clarification link uses `/clarifications?selected=OQ-001`. View in Live Session uses `/session?source=msg-008` (or the selected source). A revealed turn receives focus and scroll positioning; an unrevealed turn is shown as a labeled recorded excerpt without changing playback. History uses canonical workshop timestamps for evidence and sequence plus elapsed demo time for consultant actions, with no wall-clock randomness. Reset and restart restore all review state.

The workspace uses three panels at desktop sizes, queue/workspace with impact below at 1024, and a readable stack at 390. Status uses text and icons, selection uses pressed semantics, focus states are visible, announcements are concise and polite, and reduced motion disables entrance and transition effects.

## Phase 5 POC scope governance

`/scope` visually narrows 15 canonical capabilities into 8 Included, 2 Mocked / Simulated and 5 Out of POC Scope recommendations. The immutable `ScopeItem.decision` remains the AI recommendation; consultant decisions and optional rationale sit in `scopeOverrides` in the existing Zustand store. The inspector resolves requirement descriptions, confidence and exact transcript evidence from canonical IDs. Scenario-boundary items without conversation evidence are labeled as brief recommendations. Selection, recommendation reset and category changes work through buttons, including keyboard and mobile use. Reclassification invalidates scope and success-criteria review checks.

The illustrative scope score weights business criticality (30), demo value (25), canonical linked-record confidence (20), build feasibility (15) and external dependency (10). It supports inspection and never overrides explicit client decisions. Unlinked boundary items have no invented confidence. Complexity uses planning units: Included adds low/medium/high complexity units of 1/2/3 plus medium/high external dependency units of 1/2; Mocked adds 1; Excluded adds 0. Totals up to 12 are Focused, up to 18 Expanded, otherwise Broad. These units are a deterministic comparison aid, not an effort forecast.

Six typed success criteria reference canonical requirements and scope items. Approval requires complete functional/rule/non-functional workshop capture, all three consultant-confirmed clarifications, explicit requirement review, assumption acknowledgement, scope review and criteria review. All six mandatory criteria must remain Included; authentication and user-directory dependencies must remain Included or Mocked. Unsupported scope gaps visibly block approval. All canonical assumptions are shown for acknowledgement.

Approve POC Scope & Create Baseline creates a frozen `PocBaseline` for RB-001 / v1. It snapshots all 20 canonical record IDs, governed confirmation IDs, the actual Included/Mocked/Excluded partition, decisions and reasons, six success criteria, resolved clarifications and acknowledged assumptions. Approval uses deterministic elapsed demo time and names Consultant as reviewer. The scope becomes locked; edits are rejected in the store as well as disabled in the UI. No agent starts, generation route opens or version transition runs. Reset restores the initial recommendations and clears all review/baseline state, including unsaved inspector notes.

Requirement readiness stays on the shared Phase 3/4 model: full capture plus all three consultant reviews reaches 100%, rather than substituting the illustrative 93% example. Scope readiness separately represents five prerequisite reviews plus approval: 83% when reviews are complete and 100% after approval. Generation readiness is Awaiting approval, Ready, or Review required. Reopening or changing clarification review history after approval preserves the immutable RB-001 snapshot and returns generation readiness to Review required. Creating a replacement baseline is deferred to a later authorized phase.

The Clarification Center exposes Continue to POC Scope only after all three reviews are confirmed. Scope evidence links retain `/clarifications?selected=...` and `/session?source=...`; requirement links retain `/requirements?selected=...` in the Phase 5.5 inspector. The board has three decision groups plus a side inspector at wide desktop sizes, an inspector below the board at 1440/1024, and ordered Included → Mocked → Out of Scope → Inspector → Criteria → Approval sections on mobile. Shared theme tokens, icon/text status, pressed selection, visible focus, restrained motion and reduced-motion handling apply throughout.

## Phase 5.5 requirement intelligence

`/requirements` presents the complete recorded canonical model: 8 functional requirements, 4 business rules, 2 non-functional constraints, 3 assumptions and 3 questions. This is a reviewable catalog, not a claim that all records have been captured during current playback. Top-level Total Requirements counts all 20 records; the subtitle identifies each type and separately derives current capture coverage. Confirmed and Needs Clarification count records with those derived statuses, including reviewed questions. Actor totals describe the four canonical roles; capture coverage remains in the shared readiness breakdown. All descriptions, confidence scores, transcript quotes and source timestamps resolve from canonical catalogs.

The original catalog is immutable. `requirementView` adds selected ID, type/status/actor filters and plain-text search to the existing Zustand store. Status uses the governed confirmation selector for functional/rule/non-functional records; unresolved related questions mark unconfirmed outputs Needs Clarification. Live priority confirmations remain independent of formal question review. OQ records become Confirmed only through Clarification Center acceptance. Assumptions are Needs Review until explicitly acknowledged in the Scope review checklist or retained in the approved baseline; they are never silently presented as client facts. Records with unrevealed transcript evidence explicitly say Recorded evidence / capture pending. Brief-derived records show their brief origin rather than attributing them to a client.

`getLiveReadinessBreakdown` exposes the existing six dimensions used by `calculateLiveReadiness`: business problem 25%, actors 15%, core workflow 30%, business rules 15%, scenario-brief coverage 5% and consultant clarification review 10%. Precision is retained until the same overall rounding step. The page does not add integration or success-criteria weights. Readiness remains 0% initially, 90% after complete capture, 93% after priority review and 100% after all three reviews. Catalog quality is separate and explicitly illustrative: source linkage includes transcript or brief; confirmation includes derived confirmed records; clarified coverage counts reviewed questions; scope linkage counts direct or canonical evidence relationships. No implementation coverage is claimed.

The inspector shows full content, exact source, actors, related rules/assumptions, clarification evidence, effective scope decisions and success criteria. Relationships use shared transcript sources, canonical clarification outputs and existing scope references. They do not introduce new canonical requirement IDs or a full graph. Type and actor filters, status selection and search work without mutating downstream decisions. Selection brings the inspector into view and focuses it; reduced motion uses immediate scrolling. At desktop the catalog and inspector sit side by side; at 1024 and mobile they stack in readable order.

Links preserve `/requirements?selected=...`, `/session?source=...`, `/clarifications?selected=...` and `/scope?selected=...`. Live Session adds an inspection link; clarification impact adds requirement links; Scope honors selected scope IDs and clears that parameter on reset. Scope editing, clarification acceptance and baseline approval stay in their existing workspaces. No generation behavior, requirement editing, backend or real extraction is implemented.

## Mock data model and integrity

The catalog includes 8 functional requirements, 4 business rules, 2 non-functional requirements, 3 assumptions, and 3 open questions. Sources reference actual message IDs and timestamps. Brief-derived records are labeled accordingly. Two supplementary transcript turns provide explicit evidence for FR-005 and BR-004.

Scope includes all 8 functional requirements, 2 mocked dependencies, and 5 excluded capabilities. The initial traceability catalog provides the specified FR-003 conversation → requirement → user story → screen/API → test chain. CR-001 expands manager approval from P1-only to P1 and P2, referencing FR-007 and BR-003 plus approval rule, workflow, UI, API/logic, and test artifacts present in that catalog. V1 canonical requirements remain P1-only. These are planned mock records, not generated or approved outcomes.

Catalog counts derive from the records. Overview metrics derive from the canonical catalogs: requirement count, open/resolved questions, complete seed traceability paths, and planned POC tests. Traceability coverage requires conversation → requirement → user story → screen and API → test paths and uses functional requirements as the denominator. Current seed coverage is 1 of 8 (rounded to 13%); six planned POC tests are waiting, so Tests Passed is 0 / 6. This is explicitly labeled catalog telemetry, not live results. The 25-minute Time-to-POC is a typed illustrative estimate in `src/data/validation.ts`, not a measured claim. Live readiness is illustrative and documented above; complete outcome metrics remain deferred.

## Routes

| Route             | Workspace                | Implementation phase |
| ----------------- | ------------------------ | -------------------- |
| `/`               | Overview                 | 2                    |
| `/session`        | Live Session             | 3                    |
| `/requirements`   | Requirement Intelligence | 5.5                  |
| `/clarifications` | Clarification Center     | 4                    |
| `/scope`          | POC Scope                | 5                    |
| `/generation`     | Generation               | 6                    |
| `/preview`        | POC Preview              | 7                    |
| `/traceability`   | Traceability             | 8                    |
| `/feedback`       | Client Feedback          | 9                    |
| `/value`          | Value Report             | 10                   |

## Known limitations and specification concerns

- Automated playback ends with Live Session capture. Phase 4 resolution is an explicit consultant action; reviews and question edits are local simulations. Phase 5 scope approval is explicit and local; generation, full traceability graphs and the generated mini application remain deferred.
- Example metrics in the specification say 18 requirements and 4 clarifications; the explicit canonical catalog defines 20 total requirement records and 3 clarification questions. Preserve the canonical records and derive displayed counts in future phases.
- Scope examples enumerate 5 excluded capabilities while their summary says 4. The catalog retains all 5 listed capabilities.
- The approved Phase 9 feedback correction is a genuine approval expansion: P1-only in v1 → P1 and P2 in v2. Only future data and impact artifacts are defined; no change approval or v2 UI is implemented.
- The current traceability chain is a seed for Phase 8, not a claim of full coverage.
- State is intentionally in memory and resets on reload. Responsive layout targets desktop and laptop first.

## Future integration points

Mock transcript → meeting/audio input; requirement events → intelligence API; clarification and scope catalogs → agents; simulation → workflow engine; mock preview → generated repository and sandbox; artifact graph → actual traceability; illustrative metrics → engagement telemetry. None are implemented or required for this foundation.
