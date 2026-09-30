# Convo2POC Vision

**Conversation → Clarity → Working Prototype**

Convo2POC is an enterprise-governed Conversation-to-POC concept for presales and consulting teams. This interactive vision prototype will demonstrate structured requirements, clarification, scope approval, controlled generation, validation, traceability, and a reviewed client feedback loop.

The [master specification](docs/CONVO2POC_MASTER_SPEC.md) defines the product and phase boundaries. The canonical typed catalogs in `src/data/` are the single source of truth for scenario content and counts, following the approved corrections. **Phases 1 and 2 are implemented.** `/` is the Executive Command Center; the remaining nine product routes are labeled placeholders. Phase 3 requires explicit approval.

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

The Overview route is lazy-loaded to keep its motion and presentation code separate from the foundation bundle. The Overview uses an evidence transformation panel, connected workflow ribbon, catalog-derived telemetry, five differentiation modules, and a conceptual process comparison. Start Demo resets the entire store and navigates to `/session` without starting playback. Explore Workflow scrolls to and focuses the journey; reduced motion disables smooth scrolling and entrance motion.

The shadcn Button is local source in `src/components/ui`; `components.json` and the `@/` alias support adding components later. Semantic CSS tokens define intentionally designed light and dark themes: royal blue, cool white/pale blue surfaces in light mode, navy/blue-charcoal surfaces in dark mode, and restrained cyan/violet accents. The header uses an HCLTech typographic brand area and explicitly labels the experience “Internal Concept Prototype,” not an approved production product. The accessible theme switch stores a local presentation preference independently of demo state; light remains the default, and the saved preference applies before paint. No official logo asset or remote brand dependency is introduced. Framer Motion's provider respects the user's reduced-motion preference. XYFlow and Recharts are installed for future phases and are not imported into the initial bundle.

## Architecture

- `src/app/`: shared route metadata, router, and providers.
- `src/components/shell/`: responsive navigation, engagement top bar, and demo controls.
- `src/components/common/` and `src/components/ui/`: reusable presentation primitives.
- `src/pages/`: the reusable, explicitly labeled phase placeholder.
- `src/types/domain.ts`: requirements, transcript, scope, agents, validation, artifact graph, feedback, and version types.
- `src/data/`: canonical local scenario catalogs. Product records stay out of JSX.
- `src/store/demoStore.ts`: one in-memory Zustand store and a fresh-state factory.
- `src/simulation/`: stages and a discriminated union of typed events.
- `src/styles/`: theme and responsive shell styling.
- `src/tests/`: foundation tests.

No authentication, backend, storage service, LLM, API key, remote font, or runtime network call is required. The built application works offline when served locally. A future SPA host must serve `index.html` for deep links.

## Planned demo storyline

A fictional Acme Enterprise Services workshop covers Service Request Management Modernization. Conversation signals become requirements; questions clarify priority and assignment authority; an approved scope creates a baseline; simulated agents generate and validate a prototype; evidence links back to the conversation; reviewed feedback produces POC v2; a value report concludes the demo.

## Simulation and state

Phase 1 establishes event types, not the running simulation engine. `DemoEvent` ties each event discriminator to its payload type. Future scheduling and reduction must remain independent of pages, deterministic, and driven through the shared store. No timers run in this phase.

The initial store is idle with no visible transcript, detected requirements, approvals, or baseline. POC version starts at v1 as a label, not a generated result. All agents and build checks wait. Reset creates fresh arrays and records and preserves store actions. Demo speed accepts values from 0.25 to 4.

Playback controls and Settings are visibly disabled until their phases are implemented. Reset works without page refresh and does not change the current route. Sidebar navigation remains available regardless of demo state. Smaller screens use a keyboard-accessible navigation drawer with focus containment and Escape dismissal.

## Mock data model and integrity

The catalog includes 8 functional requirements, 4 business rules, 2 non-functional requirements, 3 assumptions, and 3 open questions. Sources reference actual message IDs and timestamps. Brief-derived records are labeled accordingly. Two supplementary transcript turns provide explicit evidence for FR-005 and BR-004.

Scope includes all 8 functional requirements, 2 mocked dependencies, and 5 excluded capabilities. The initial traceability catalog provides the specified FR-003 conversation → requirement → user story → screen/API → test chain. CR-001 expands manager approval from P1-only to P1 and P2, referencing FR-007 and BR-003 plus approval rule, workflow, UI, API/logic, and test artifacts present in that catalog. V1 canonical requirements remain P1-only. These are planned mock records, not generated or approved outcomes.

Catalog counts derive from the records. Overview metrics derive from the canonical catalogs: requirement count, open/resolved questions, complete seed traceability paths, and planned POC tests. Traceability coverage requires conversation → requirement → user story → screen and API → test paths and uses functional requirements as the denominator. Current seed coverage is 1 of 8 (rounded to 13%); six planned POC tests are waiting, so Tests Passed is 0 / 6. This is explicitly labeled catalog telemetry, not live results. The 25-minute Time-to-POC is a typed illustrative estimate in `src/data/validation.ts`, not a measured claim. Readiness and complete outcome metrics remain deferred.

## Routes

| Route             | Workspace                | Implementation phase |
| ----------------- | ------------------------ | -------------------- |
| `/`               | Overview                 | 2                    |
| `/session`        | Live Session             | 3                    |
| `/requirements`   | Requirement Intelligence | 4                    |
| `/clarifications` | Clarifications           | 4                    |
| `/scope`          | POC Scope                | 5                    |
| `/generation`     | Generation               | 6                    |
| `/preview`        | POC Preview              | 7                    |
| `/traceability`   | Traceability             | 8                    |
| `/feedback`       | Client Feedback          | 9                    |
| `/value`          | Value Report             | 10                   |

## Known limitations and specification concerns

- No playback orchestration, approval flow, graphs, charts, or generated mini application is implemented. Phase 2 implements only the Overview.
- Example metrics in the specification say 18 requirements and 4 clarifications; the explicit canonical catalog defines 20 total requirement records and 3 clarification questions. Preserve the canonical records and derive displayed counts in future phases.
- Scope examples enumerate 5 excluded capabilities while their summary says 4. The catalog retains all 5 listed capabilities.
- The approved Phase 9 feedback correction is a genuine approval expansion: P1-only in v1 → P1 and P2 in v2. Only future data and impact artifacts are defined; no change approval or v2 UI is implemented.
- The current traceability chain is a seed for Phase 8, not a claim of full coverage.
- State is intentionally in memory and resets on reload. Responsive layout targets desktop and laptop first.

## Future integration points

Mock transcript → meeting/audio input; requirement events → intelligence API; clarification and scope catalogs → agents; simulation → workflow engine; mock preview → generated repository and sandbox; artifact graph → actual traceability; illustrative metrics → engagement telemetry. None are implemented or required for this foundation.
