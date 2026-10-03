# Phase 9.5 Demo Director review

Implemented only the optional presentation orchestration layer. Existing manual experiences remain available. Phase 10 and the Value Report remain unimplemented.

## Architecture and files

- `src/demo/demoTypes.ts`: nine typed chapters; step, simulation lane, action, condition, target and director state models.
- `src/demo/demoStory.ts`: 35 declarative steps with narration, routes, semantic spotlights, minimum durations, domain waits and disclosed consultant gates.
- `src/demo/demoDirector.ts`: orchestrates the existing simulation engines, maps canonical milestones onto presentation time and reconstructs valid prerequisites.
- `src/demo/demoActions.ts`: calls the existing guarded public store actions; isolates guided progression from conflicting manual mutations.
- `src/demo/demoConditions.ts`, `demoSelectors.ts`, `demoValidation.ts`: semantic waits, derived progress and configuration integrity checks.
- `src/store/demoStore.ts`: adds the director slice and public presenter actions to the existing store. Original domain transitions remain intact.
- `src/components/demo/`: presenter dock, completion view, controlled-fieldset wrapper, navigation hook and semantic target registry.
- `src/styles/demoDirector.css`: shared-token spotlights, presentation layout, dock, completion and responsive/reduced-motion styles.
- Existing Overview hero/page: explicit Run Full Demo and Explore Manually choices. Existing shell: conditional attachment and cleanup of the shared clock, presenter and completion composition.
- Existing session, clarification, requirement, scope, generation, preview, traceability and feedback components: small semantic ref/attribute integrations and optional guided control guards. Manual layout remains intact.
- `src/tests/demoDirectorState.test.ts`, `demoDirector.test.tsx`: 19 new state/integration tests. Existing Overview tests use the renamed manual entry action and an adequate lazy-route wait.
- `README.md`: extension and behavior documentation.

## Presentation design

Default duration is **311 seconds (5:11)**, derived from the script. Speeds are 0.75×, 1×, 1.5× and 2×. Canonical transcript and audit timestamps remain unchanged. The director advances the real engines toward canonical milestones and holds canonical time while the viewer reads; active-agent visuals remain active until an actual pause or transition.

Advancement requires the expected route, minimum duration and real domain condition. Missing prerequisites pause visibly rather than being skipped. The shared clock is attached only when an engine or the unblocked director is running; pause, completion and exit dispose the relevant timer.

Narration changes by step. React refs register stable `data-demo-target` regions; the director scrolls these refs once per step and applies a restrained outline. No DOM selector workflow, synthetic click, fake mouse, separate domain store or duplicated test/requirement catalog is used. Reduced motion uses immediate scrolling and suppresses spotlight transitions.

Clarification confirmation, RB-001 approval, v1 demonstration review and CR-001 approval each display **“Simulating consultant approval for this guided demo”** and a visible 3/2/1 countdown before invoking the original consultant action. Pause freezes the countdown and all controlled progression.

Previous, Next and chapter selection reset and replay the valid prefix through real actions. A preparation note discloses required simulated approvals. Manual route deviation freezes progression and offers Return to Demo or Exit Autopilot. Exit keeps the reached product state and pauses simulations; manual controls become available again. Completion is a dedicated view on the reached preview route, with actual-state summaries and replay/manual/review actions.

## Tests and validation

**210 tests passed across 23 files**, including all prior phase tests.

Coverage includes full domain and route sequences, P1 work rejection before manager approval, explicit countdown gates, immutable canonical catalogs, all chapters, deterministic Next/Previous/restart, speed changes, semantic-condition waiting, active-agent milestone holds, pause/resume, route deviation, manual mutation isolation, manual recovery, clock cleanup, reduced motion and semantic ref cleanup. The final sequence verifies preserved RB-001/v1, CR-001, approved RB-002, validated targeted regeneration, v1 P2 without approval and v2 P2 requiring approval.

| Validation             | Result     |
| ---------------------- | ---------- |
| `npm run format`       | Passed     |
| `npm run typecheck`    | Passed     |
| `npm run lint`         | Passed     |
| `npm run test`         | 210 passed |
| `npm run build`        | Passed     |
| `npm run format:check` | Passed     |
| `git diff --check`     | Passed     |

## Browser review

The full automated journey completed against the stable production preview at 2×, through all existing routes, CR-001, RB-002, targeted regeneration, the v1/v2 P2 comparison and Demo Completion. The stable-run console recorded no warnings or errors. All presenter controls were exercised, including mobile More/Chapters, navigation deviation/return, exit and manual session playback.

Dark and light review covered 1920, 1440, 1024 and 390 widths. Completion, governance/dock, generated POC and generation and feedback change-governance layouts were checked. Measured page scroll widths remained within the viewport:

| Viewport width | Page scroll width | Horizontal overflow |
| -------------- | ----------------- | ------------------- |
| 1920           | 1905              | None                |
| 1440           | 1425              | None                |
| 1024           | 1009              | None                |
| 390            | 375               | None                |

The 15-pixel difference is the vertical scrollbar. Semantic mobile approval highlighting and the responsive dock were visually inspected. Clock disposal is covered by the integration test; exit also returned the browser to usable manual controls and manual playback.

## Remaining concerns

No blocking concerns. This remains a deterministic, in-memory vision prototype with explicitly simulated approvals. Reload an already open preview tab after rebuilding: an intermediate review rebuilt assets during playback and invalidated an older lazy-loaded URL; the stable final-build walkthrough completed cleanly. Chapter preparation intentionally replays a canonical story prefix instead of preserving arbitrary manual edits within that guided run. Exiting retains the reached state for manual exploration. No Phase 10 work was started.
