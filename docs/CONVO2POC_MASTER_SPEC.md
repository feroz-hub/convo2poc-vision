# Convo2POC Vision — Codex Master Specification

## 0. Codex Role

You are acting as a senior product engineer, frontend architect, UX engineer, and demo-experience designer.

Build a polished, advanced, production-quality **React SPA vision prototype** named:

# `convo2poc-vision`

This is **not** the production Convo2POC platform yet.

It is an **interactive vision simulator** whose purpose is to help HCLTech internal stakeholders, presales teams, architects, developers, and decision-makers immediately understand the Convo2POC idea.

The app must visually demonstrate this core concept:

> **Convo2POC transforms a client requirement conversation into structured requirements, clarification questions, an approved POC scope, an AI-generated working prototype, traceability, and a versioned client feedback loop.**

The experience must feel like a premium enterprise AI engineering command center, not like a generic admin dashboard.

---

# 1. Primary Product Goal

The SPA must make a viewer understand the full Convo2POC story in under 5 minutes.

The viewer should be able to see this complete flow:

```text
Client Conversation
        ↓
Live Requirement Intelligence
        ↓
Ambiguity / Clarification Detection
        ↓
POC Readiness
        ↓
Recommended POC Scope
        ↓
Human Approval
        ↓
AI Agent Orchestration
        ↓
Application Generation
        ↓
Automated Build / Test Validation
        ↓
Generated POC Preview
        ↓
Requirement Traceability
        ↓
Client Feedback
        ↓
Impact Analysis
        ↓
POC V2
        ↓
Value Creation Report
```

The prototype should feel believable enough that stakeholders can imagine the real product being built behind it.

---

# 2. Product Positioning

Do not position this as merely:

- voice-to-code
- meeting transcription
- an AI coding tool
- a chatbot
- a generic app builder

The product must be positioned as:

> **An enterprise-governed Conversation-to-POC platform for presales and consulting teams.**

The differentiation must visibly emphasize:

1. Live requirement intelligence
2. Ambiguity and clarification detection
3. POC scope intelligence
4. Human approval gates
5. Requirement-to-implementation traceability
6. Controlled AI generation
7. Testing and validation
8. Client feedback → change impact → POC V2
9. Measurable Time-to-POC value

---

# 3. Target Audience

Primary viewers:

- Presales consultants
- Business analysts
- Solution architects
- Technical leads
- Developers
- Delivery managers
- Innovation / Value Creation reviewers
- Internal leadership

The UI should be understandable to non-developers while still feeling technically credible to architects and engineers.

---

# 4. MVP Nature

This version is a **simulation-first frontend prototype**.

Do NOT build:

- real backend services
- real database
- real authentication
- real Teams integration
- real microphone streaming
- real speech-to-text
- real LLM calls
- real code generation
- real Docker orchestration
- real deployment
- real client data integrations

Instead, use:

- deterministic mock data
- timed simulated events
- local SPA state
- realistic UI transitions
- realistic generated artifacts
- simulated agent activity
- simulated build/test status
- a mock embedded generated application

The prototype must be reliable during a live internal demo.

---

# 5. Required Technology Stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- `@xyflow/react` for graphs / orchestration / traceability
- Recharts for charts
- Lucide React for icons
- React Router
- Zustand or a lightweight equivalent for global demo state
- Vitest
- React Testing Library
- ESLint
- Prettier

Use latest stable mutually compatible versions.

Avoid unnecessary dependencies.

No backend is required.

---

# 6. Project Quality Requirements

The codebase must be:

- strongly typed
- modular
- maintainable
- responsive
- accessible
- easy to extend later with a real backend
- free from large monolithic page components
- driven by reusable data models and reusable UI components

No important product behavior should be hardcoded directly inside JSX.

Use typed mock data and a typed simulation engine.

---

# 7. Visual Direction

## Overall Style

Create a premium enterprise AI interface with:

- dark-first interface
- clean deep navy / charcoal backgrounds
- subtle gradient glows
- glass-like elevated panels
- strong contrast
- generous spacing
- modern typography
- understated animation
- crisp data visualization
- minimal visual noise
- enterprise credibility

Avoid:

- childish AI visuals
- excessive neon
- gaming aesthetics
- clutter
- gratuitous gradients
- overly rounded “consumer app” styling
- giant emoji-heavy UI
- generic SaaS template appearance

The feeling should be:

> Enterprise consulting + AI command center + modern developer platform.

## Typography

Use a clean modern sans-serif.

Typography hierarchy should be obvious:

- Product / page title
- Section titles
- Metric labels
- Body
- Metadata
- System / agent output

Use monospaced styling selectively for:

- requirement IDs
- timestamps
- build logs
- API paths
- code references

---

# 8. Brand

Primary product name:

# Convo2POC

Primary tagline:

> **Conversation → Clarity → Working Prototype**

Alternative hero statement:

> **Turn client conversations into validated working POCs.**

Supporting statement:

> Capture requirements, resolve ambiguity, define POC scope, generate, validate, trace, and iterate — in one governed workflow.

Do not overuse the HCLTech name or recreate any trademarked visual identity.

This is a concept prototype suitable for internal demonstration.

---

# 9. Global Application Shell

Create a consistent application shell.

## Left Sidebar

Include:

- Convo2POC logo / wordmark
- Overview
- Live Session
- Requirement Intelligence
- Clarifications
- POC Scope
- Generation
- POC Preview
- Traceability
- Client Feedback
- Value Report

Bottom area:

- Demo Scenario
- Settings
- “Vision Prototype” badge

Highlight the active route.

Sidebar may collapse on smaller widths.

## Top Bar

Include:

- engagement name
- client / scenario name
- session status
- demo controls
- reset action
- current POC version

Example:

```text
Acme Service Operations Transformation
POC v1
● Demo Session Active
```

## Demo Controls

Always make it easy to:

- Run Demo
- Pause
- Resume
- Restart
- Skip to Next Stage
- Reset Scenario

The demo must never require refreshing the browser.

---

# 10. Primary Demo Scenario

Use one canonical scenario across the entire SPA.

## Scenario Name

**Service Request Management Modernization**

## Fictional Client

Use a generic fictional client name such as:

**Acme Enterprise Services**

Do not use a real company.

## Business Problem

Employees currently raise internal service requests using email and spreadsheets.

Requests are manually triaged, assigned, and tracked.

The client wants a lightweight digital workflow.

## Actors

- Employee
- Support Engineer
- Administrator
- Manager

## Core Requirements

### FR-001
Employees can create a service request.

### FR-002
Employees can view their submitted requests.

### FR-003
Administrators can assign requests to support engineers.

### FR-004
Support engineers can update request status.

### FR-005
Users can view request details and history.

### FR-006
A dashboard shows request counts by status and priority.

### FR-007
P1 requests require manager approval.

### FR-008
Closed requests remain searchable.

## Business Rules

### BR-001
Valid priorities are P1, P2, P3, and P4.

### BR-002
Only administrators can assign support engineers.

### BR-003
P1 requests require manager approval before work begins.

### BR-004
Closed requests cannot be edited except for administrator notes.

## Non-Functional Requirements

### NFR-001
The POC should load quickly and provide responsive desktop behavior.

### NFR-002
The POC should use a simple role-based demo experience.

## Open Questions at Initial Capture

### OQ-001
What defines a high-priority request?

### OQ-002
Can support engineers reassign requests?

### OQ-003
Should email notifications be included in the first POC?

## Assumptions

### ASM-001
Production SSO is not required for the POC.

### ASM-002
Email integration may be simulated.

### ASM-003
Synthetic demo data may be used.

---

# 11. Demo Transcript

Create a realistic simulated client conversation.

Example transcript sequence:

### 00:05 — Consultant
“Can you walk us through how employees raise support requests today?”

### 00:12 — Client
“Most requests come through email. Sometimes they are also tracked in Excel.”

Detected:
- business problem
- manual intake
- fragmented tracking

### 00:34 — Client
“We want employees to create requests in one place and see the status.”

Detected:
- FR-001
- FR-002

### 01:02 — Client
“Admins should be able to assign requests to the right support engineer.”

Detected:
- FR-003
- Actor: Administrator
- Actor: Support Engineer

### 01:34 — Client
“The engineer should update the request as work progresses.”

Detected:
- FR-004
- lifecycle / status workflow

### 02:10 — Client
“High-priority requests should require approval.”

Detected:
- ambiguous business rule
- OQ-001

### 02:17 — Convo2POC
Flag ambiguity:
“What determines whether a request is high priority?”

### 02:30 — Client
“We already use P1 to P4. P1 should require manager approval.”

Resolved:
- BR-001
- FR-007
- BR-003

### 03:05 — Consultant
“Should engineers be able to reassign a request?”

### 03:13 — Client
“No. Only admins should assign or reassign.”

Resolved:
- OQ-002
- BR-002

### 03:48 — Client
“We need a simple dashboard as well.”

Detected:
- FR-006

### 04:10 — Consultant
“Do you need email notifications in the first prototype?”

### 04:16 — Client
“Not for the first POC. We can add that later.”

Resolved:
- OQ-003
- Email moves to out-of-scope

### 04:35 — Client
“Closed requests should still be searchable.”

Detected:
- FR-008

The simulation engine should reveal these events progressively.

---

# 12. Core Data Models

Create typed models.

Suggested interfaces:

```ts
type RequirementType =
  | "functional"
  | "non-functional"
  | "business-rule"
  | "assumption"
  | "open-question";

type RequirementStatus =
  | "detected"
  | "needs-clarification"
  | "confirmed"
  | "excluded"
  | "implemented";

interface TranscriptMessage {
  id: string;
  speaker: string;
  role: "client" | "consultant" | "system";
  timestamp: string;
  text: string;
}

interface Requirement {
  id: string;
  type: RequirementType;
  title: string;
  description: string;
  status: RequirementStatus;
  confidence: number;
  sourceMessageId?: string;
  sourceTimestamp?: string;
  speaker?: string;
  tags?: string[];
}

interface Clarification {
  id: string;
  requirementId: string;
  question: string;
  reason: string;
  options?: string[];
  status: "open" | "resolved";
  answer?: string;
}

interface ScopeItem {
  id: string;
  title: string;
  requirementIds: string[];
  decision: "included" | "mocked" | "excluded";
  reason: string;
}

interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: "waiting" | "running" | "complete" | "failed";
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

interface BuildCheck {
  id: string;
  label: string;
  status: "waiting" | "running" | "passed" | "failed";
  duration?: string;
}

interface TraceNode {
  id: string;
  type:
    | "conversation"
    | "requirement"
    | "user-story"
    | "screen"
    | "api"
    | "test";
  label: string;
  metadata?: Record<string, string>;
}

interface ChangeRequest {
  id: string;
  sourceMessageId: string;
  previousValue: string;
  newValue: string;
  impactedArtifacts: string[];
  status: "detected" | "approved" | "applied";
}
```

Use these or improve them, but keep the system typed.

---

# 13. Demo Simulation Engine

This is a critical requirement.

Create a deterministic event-driven simulation engine.

Suggested file:

```text
src/simulation/demoEngine.ts
```

The engine must support:

- start
- pause
- resume
- reset
- restart
- skip event
- jump to stage
- speed multiplier if practical

Use a list of typed events.

Example:

```ts
interface DemoEvent {
  id: string;
  at: number;
  stage:
    | "conversation"
    | "requirements"
    | "clarification"
    | "scope"
    | "generation"
    | "preview"
    | "traceability"
    | "feedback"
    | "value";
  type: string;
  payload: unknown;
}
```

Sample events:

```ts
[
  {
    id: "evt-001",
    at: 1000,
    stage: "conversation",
    type: "TRANSCRIPT_MESSAGE",
    payload: { messageId: "msg-001" }
  },
  {
    id: "evt-002",
    at: 3500,
    stage: "requirements",
    type: "REQUIREMENT_DETECTED",
    payload: { requirementId: "FR-001" }
  },
  {
    id: "evt-003",
    at: 9000,
    stage: "clarification",
    type: "AMBIGUITY_DETECTED",
    payload: { clarificationId: "OQ-001" }
  }
]
```

Do not tightly couple the simulation engine to a page.

The whole application should react to global state.

---

# 14. Screen 1 — Overview / Executive Command Center

Route:

```text
/
```

Goal:
Explain Convo2POC immediately.

## Hero

Title:

> **Turn client conversations into validated working POCs**

Subtitle:

> Convo2POC captures requirements, resolves ambiguity, defines the right POC scope, orchestrates AI generation, validates the result, and preserves end-to-end traceability.

Buttons:

- Start Demo
- Explore Workflow

## Workflow Visualization

Show:

```text
Conversation
→ Requirements
→ Clarify
→ Scope
→ Generate
→ Validate
→ Demo
→ Iterate
```

Use an elegant connected timeline.

## Key KPI Cards

Show illustrative values:

- Time-to-POC: `25 min`
- Requirements Captured: `18`
- Clarifications Resolved: `4`
- Traceability: `100%`
- Tests Passed: `32 / 32`

Mark these clearly as demo metrics.

## Differentiation Cards

Include:

- Requirement Intelligence
- Scope Intelligence
- Governed Generation
- Traceability
- Feedback-to-Version Loop

---

# 15. Screen 2 — Live Client Session

Route:

```text
/session
```

This is a major “wow” screen.

## Layout

Desktop:
- left 60–65%: conversation
- right 35–40%: live intelligence panel

## Left — Conversation Area

Show:

- live session badge
- elapsed timer
- participant avatars / initials
- speaker-separated messages
- active speaker animation
- waveform-like visual indicator
- meeting title

Messages should appear progressively during demo playback.

## Right — Live Intelligence

Show dynamic counters:

- Requirements detected
- Confirmed
- Needs clarification
- Actors
- Assumptions
- Open questions

New requirements should animate into the list.

Each detection should briefly pulse or highlight.

Example:

```text
+ FR-003
Admin can assign requests
Confidence 96%
```

## System Insight Card

When ambiguity occurs, show:

> **Ambiguity detected**
> “High priority” is not measurable yet.

CTA:

- Review Clarification

---

# 16. Screen 3 — Requirement Intelligence

Route:

```text
/requirements
```

Goal:
Show that the product builds a structured requirement model, not just a transcript.

## Top Summary

- Business Problem
- Objective
- Actors
- Requirement count
- Open questions
- Assumptions
- POC readiness

## Readiness Gauge

Example:

```text
POC Readiness
88%
```

Provide component scores:

- Business Problem — 100%
- User Roles — 100%
- Core Workflow — 95%
- Business Rules — 78%
- Integrations — 70%
- Success Criteria — 80%

## Requirement Table / Cards

Allow filters:

- All
- Functional
- Business Rules
- Non-Functional
- Assumptions
- Open Questions

Columns / card metadata:

- ID
- Description
- Status
- Confidence
- Source
- Type

Clicking a requirement opens a side drawer.

## Requirement Drawer

Display:

- requirement ID
- complete description
- source transcript quote
- speaker
- timestamp
- confidence
- status
- related actors
- related scope decision
- related artifacts if generated

Provide “Jump to conversation source”.

---

# 17. Screen 4 — Clarification Center

Route:

```text
/clarifications
```

Goal:
Show that Convo2POC refuses to silently guess.

## Main Header

> **Resolve uncertainty before generation**

Show:

- Open: 3
- Resolved: 0 → updates during demo

## Clarification Card

Example:

```text
OQ-001

Client statement:
“High-priority requests should require approval.”

Why this is ambiguous:
“High priority” has no measurable definition.

Suggested question:
“What determines whether a request is high priority?”

Suggested options:
- Existing priority field
- Monetary value
- Request category
- Custom rule
```

During demo resolution, animate to:

```text
Resolved
P1 requests require manager approval.
```

Update affected requirement badges immediately.

---

# 18. Screen 5 — POC Scope Studio

Route:

```text
/scope
```

This is a major differentiator screen.

## Header

> **Define the smallest POC that proves the client’s core workflow**

## Three Columns

### Included
Examples:

- Create service request
- View requests
- Assign support engineer
- Update status
- Approval for P1
- Dashboard
- Search closed requests

### Mocked
Examples:

- Authentication
- User directory

### Out of Scope
Examples:

- Email notifications
- Production SSO
- SLA automation
- Mobile application
- Production integrations

Each item must show:

- linked requirement IDs
- decision reason
- complexity
- estimated POC relevance

## Scope Summary

Display:

- 8 requirements included
- 2 mocked dependencies
- 4 capabilities excluded
- POC readiness: 94%

## Human Approval Gate

Large CTA:

> **Approve POC Scope & Generate**

Before approval, show a review checklist:

- Requirements reviewed
- Clarifications resolved
- Assumptions acknowledged
- Scope reviewed

When approved:
- lock baseline visually
- create “Requirement Baseline RB-001”
- transition to Generation screen

---

# 19. Screen 6 — Generation Command Center

Route:

```text
/generation
```

This is the most visually advanced screen.

## Agent Graph

Use `@xyflow/react`.

Nodes:

- Requirement Agent
- Scope / Architecture Agent
- UI Agent
- Backend Agent
- Data Agent
- Test Agent
- Security Check
- Deployment Agent

Suggested graph:

```text
Requirement Agent
       ↓
Architecture Agent
   ↙      ↓      ↘
 UI     Backend   Data
   ↘      ↓      ↙
      Test Agent
          ↓
    Security Check
          ↓
      Deployment
```

Statuses:

- waiting
- running
- completed
- failed

Animate running connections subtly.

## Agent Activity Panel

Show realistic log entries:

```text
10:42:18  Requirement baseline loaded
10:42:21  8 functional requirements mapped
10:42:28  Application routes planned
10:42:34  Database schema generated
10:42:48  API contract generated
10:43:06  Frontend feature shell created
```

Do not create fake terminal noise.

Keep logs meaningful.

## Overall Progress

Example:

```text
Generation Progress
67%
```

Stage indicators:

- Requirements ✓
- Architecture ✓
- Database ✓
- Backend ●
- Frontend ●
- Tests ○
- Security ○
- Deployment ○

## Artifacts Panel

Show generated artifacts:

- `architecture.md`
- `api-contract.json`
- `schema.sql`
- `frontend/`
- `backend/`
- `tests/`
- `demo-data.json`

---

# 20. Screen 7 — POC Ready / Generated POC Preview

Route:

```text
/preview
```

## Success Header

> **POC Ready for Human Review**

Summary:

- Build: Passed
- UI: Passed
- API: Passed
- Tests: 32 / 32
- Traceability: 100%
- Security baseline: Passed

## Main Layout

Left / center:
embedded mock generated service-request application.

Right:
POC evidence panel.

## Mock Generated POC

Create a fully interactive mini app inside the SPA.

It should include:

### Dashboard
- Open requests
- In progress
- Awaiting approval
- Closed
- chart by priority

### Request List
- sample requests
- priority
- assigned engineer
- status

### Request Detail
- history timeline
- requester
- assignee
- approval status

### Create Request
- title
- description
- priority
- category

### Admin Assignment
- assign support engineer

This mini app does not need its own backend.

Use mock local state.

## Evidence Panel

For current feature / screen show:

- requirement IDs
- implemented artifacts
- related tests
- source transcript timestamp

---

# 21. Screen 8 — Traceability Explorer

Route:

```text
/traceability
```

This is one of the strongest enterprise screens.

Use `@xyflow/react`.

Example chain:

```text
Client Statement
      ↓
FR-003
      ↓
US-004
   ↙      ↘
Screen    API
   ↘      ↙
    TC-012
```

## Node Types

- Conversation
- Requirement
- User Story
- Screen
- API
- Test

## Interaction

Clicking a node opens a detail panel.

Example requirement detail:

```text
FR-003
Administrators can assign support engineers.

Source:
Client Meeting — 01:02

Implementation:
Admin Assignment screen
PUT /requests/{id}/assign

Tests:
TC-012
TC-013
```

## Traceability Health

Display:

- Requirements mapped: 8 / 8
- Features mapped: 100%
- Tests mapped: 100%
- Unmapped artifacts: 0

---

# 22. Screen 9 — Client Feedback / POC V2

Route:

```text
/feedback
```

Goal:
Show the closed-loop value.

## Simulated Feedback Conversation

Client says:

> “The workflow looks good, but managers should not assign requests. Only administrators should assign or reassign.”

Then detect:

```text
CHANGE REQUEST DETECTED

Previous:
Manager / Admin may assign requests

New:
Only Administrator may assign or reassign requests
```

## Impact Analysis

Show affected items:

- BR-002
- FR-003
- Assignment screen
- `PUT /requests/{id}/assign`
- authorization rule
- TC-012
- TC-013
- TC-014

## Approval

Button:

> **Approve Change & Create POC v2**

Then animate:

```text
POC v1 → POC v2
```

Show version timeline:

- RB-001 / POC v1
- CR-001 approved
- RB-002 / POC v2

---

# 23. Screen 10 — Value Creation Report

Route:

```text
/value
```

The demo should finish here.

## Hero Metric

# Time-to-POC

Display:

```text
25 minutes
```

Mark as illustrative demo measurement.

## Engagement Metrics

Use cards:

- Meeting Duration: 10m 24s
- Requirements Captured: 18
- Clarifications Detected: 4
- Clarifications Resolved: 4
- Included POC Requirements: 8
- Tests Passed: 32 / 32
- Traceability Coverage: 100%
- Human Approval Gates: 2
- POC Versions: 2

## Traditional vs Convo2POC Conceptual Comparison

Do not present invented financial savings.

Use qualitative / illustrative comparison:

```text
Traditional
Conversation
→ Notes
→ Requirement handoff
→ Architecture
→ Development
→ Testing
→ Demo

Convo2POC
Conversation
→ Structured requirements
→ Clarify
→ Approved scope
→ Generate
→ Validate
→ Demo
```

## Value Pillars

Show:

- Faster Time-to-POC
- Earlier Requirement Validation
- Reduced Interpretation Gaps
- Reusable POC Assets
- Standardized Governance
- End-to-End Traceability

## Final CTA

> **From conversation to demonstrable value — faster, clearer, governed.**

Buttons:

- Replay Demo
- View Traceability
- View POC Scope

---

# 24. Additional UX Requirements

## Navigation

Users must be able to:

- manually navigate every page
- follow the automated demo
- resume where the demo currently is

The app should not force linear navigation.

## Empty / Waiting States

Every page should look meaningful before data arrives.

Example:

> Waiting for requirement signals…

## Loading

Use skeletons selectively.

Avoid generic spinners everywhere.

## Status Language

Use clear enterprise terms:

- Detected
- Needs Clarification
- Confirmed
- Approved
- Running
- Passed
- Ready for Review

Avoid hype words such as:

- Magic
- Genius
- Super AI
- Autonomous miracle

---

# 25. Animation Requirements

Use Framer Motion deliberately.

Animate:

- requirement cards appearing
- counters updating
- clarification detection
- readiness gauge movement
- scope approval transition
- agent nodes changing status
- progress bars
- build check completion
- change impact highlighting
- POC version transition

Animations should:

- communicate state
- be subtle
- remain performant
- respect `prefers-reduced-motion`

Do not over-animate every card.

---

# 26. Responsiveness

Primary demo target:

- 1440px desktop
- 1920px presentation screen

Also support:

- 1024px laptop
- tablet reasonably

Mobile support is desirable but not the primary demo target.

At smaller breakpoints:

- sidebar collapses
- graphs remain pannable
- multi-column layouts stack
- no horizontal page overflow

---

# 27. Accessibility

At minimum:

- semantic HTML
- keyboard-accessible controls
- sufficient contrast
- visible focus states
- labels for form controls
- tooltips not required for essential information
- reduced-motion support
- no information communicated by color alone

---

# 28. Reusable Components

Create reusable components such as:

```text
AppShell
Sidebar
TopBar
DemoControls
PageHeader
MetricCard
StatusBadge
ProgressRing
ReadinessGauge
TranscriptFeed
TranscriptMessage
RequirementCard
RequirementDrawer
ClarificationCard
ScopeColumn
ScopeItemCard
ApprovalGate
AgentGraph
AgentNode
AgentActivityFeed
BuildPipeline
BuildCheckRow
ArtifactList
PocPreviewFrame
TraceabilityGraph
TraceabilityDrawer
ChangeImpactPanel
VersionTimeline
ValueMetric
```

Do not over-abstract tiny components.

---

# 29. Suggested Folder Structure

```text
convo2poc-vision/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── shell/
│   │   ├── common/
│   │   ├── session/
│   │   ├── requirements/
│   │   ├── scope/
│   │   ├── generation/
│   │   ├── preview/
│   │   ├── traceability/
│   │   └── value/
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── LiveSessionPage.tsx
│   │   ├── RequirementsPage.tsx
│   │   ├── ClarificationsPage.tsx
│   │   ├── ScopePage.tsx
│   │   ├── GenerationPage.tsx
│   │   ├── PreviewPage.tsx
│   │   ├── TraceabilityPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   └── ValueReportPage.tsx
│   ├── data/
│   │   ├── scenario.ts
│   │   ├── transcript.ts
│   │   ├── requirements.ts
│   │   ├── scope.ts
│   │   ├── agents.ts
│   │   ├── traceability.ts
│   │   └── metrics.ts
│   ├── simulation/
│   │   ├── demoEngine.ts
│   │   ├── demoEvents.ts
│   │   └── stages.ts
│   ├── store/
│   │   └── demoStore.ts
│   ├── types/
│   │   └── domain.ts
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── tests/
│   ├── main.tsx
│   └── App.tsx
├── public/
├── AGENTS.md
├── README.md
├── package.json
└── vite.config.ts
```

Adjust structure when justified, but preserve domain separation.

---

# 30. State Management

Use one coherent global demo store.

It should track:

```ts
interface DemoState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedMs: number;
  currentStage: string;

  visibleTranscriptMessageIds: string[];
  detectedRequirementIds: string[];
  resolvedClarificationIds: string[];

  scopeApproved: boolean;
  baselineVersion: string;

  agentStatuses: AgentStatus[];
  buildChecks: BuildCheck[];

  currentPocVersion: "v1" | "v2";
  approvedChangeIds: string[];

  demoSpeed: number;
}
```

The simulation engine drives this state.

Pages read from it.

---

# 31. Mock Data Integrity

All demo data must be internally consistent.

Examples:

- Requirement IDs in scope must exist.
- Traceability links must point to real requirement IDs.
- Tests must map to actual requirements.
- Change-impact references must map to artifacts visible elsewhere.
- Transcript timestamps must match requirement evidence.
- Counts shown in KPI cards must match underlying data.

Do not fake arbitrary numbers inconsistently.

---

# 32. POC Readiness Formula

Use a deterministic illustrative formula.

Example dimensions:

```text
Business Problem       100%
Actors                 100%
Core Workflow           95%
Business Rules          90%
Clarifications         100%
Integration Detail      75%
Success Criteria        85%
```

Calculate an overall weighted readiness.

Document the calculation in code comments or README.

Label it as an illustrative readiness model.

---

# 33. Traceability Model

Minimum traceability chain:

```text
Transcript Message
→ Requirement
→ User Story
→ UI Screen / API
→ Test
```

Example:

```text
msg-003
→ FR-003
→ US-004
→ Admin Assignment
→ PUT /requests/{id}/assign
→ TC-012 / TC-013
```

This chain must be navigable from the Traceability screen.

---

# 34. Versioning Model

Start with:

```text
RB-001
POC v1
```

After approved feedback:

```text
CR-001
RB-002
POC v2
```

Show:

- what changed
- why it changed
- source client feedback
- impacted artifacts
- resulting version

---

# 35. Demo Reliability

The prototype will be presented live.

Therefore:

- no required network calls
- no remote API dependency
- no external data dependency
- demo works offline after dependencies are installed and app is built
- no randomly generated outputs
- no timing race conditions
- restarting demo always restores known initial state
- “Skip to stage” must work
- all navigation must remain functional if demo is paused

---

# 36. Testing

Add tests for critical logic.

At minimum:

## Unit

- readiness score calculation
- demo event ordering
- reset behavior
- stage jumping
- requirement filtering
- change impact mapping

## Component

- RequirementCard
- ClarificationCard
- ApprovalGate
- BuildPipeline

## Integration / Page

- start demo
- requirements appear
- clarification resolves
- scope can be approved
- generation completes
- preview becomes available
- feedback can create POC v2

Do not chase 100% coverage.

Cover demo-critical behavior.

---

# 37. Error Handling

Even in a simulation, create believable safe states.

Examples:

- agent failure card
- test failure state
- retry action
- “Generation paused for review”

But the default scripted demo should complete successfully.

Optionally add a separate “Failure Scenario” later, but do not make it part of the first required build.

---

# 38. Performance

Aim for:

- fast first load
- smooth 60fps-like transitions
- lazy-load heavy routes / graph components when appropriate
- no expensive re-render loops
- memoize graph elements if needed

Do not sacrifice maintainability for micro-optimizations.

---

# 39. Security / Governance Messaging

The prototype must visibly communicate governance.

Include visual concepts such as:

- Human Approval Required
- Requirement Baseline Locked
- Synthetic Demo Data
- Sandbox Environment
- Generated POC — Not Production Ready
- Security Validation Passed
- No Production Integrations

This reinforces that Convo2POC is governed, not blindly autonomous.

---

# 40. Content Rules

Use concise, credible enterprise language.

Do not write:

> “AI magically builds your app.”

Write:

> “Convo2POC generated a reviewable prototype from the approved requirement baseline.”

Do not make unverified business claims.

Use:

> “Illustrative demo metric”

where necessary.

---

# 41. README Requirements

Create a strong README containing:

1. What Convo2POC is
2. Purpose of this vision prototype
3. Demo storyline
4. Tech stack
5. How to install
6. How to run
7. How to test
8. Project architecture
9. Simulation engine explanation
10. Mock data model
11. Routes
12. Known limitations
13. Future integration points

Commands should be clear, e.g.:

```bash
npm install
npm run dev
npm run test
npm run build
npm run lint
```

Use actual package-manager commands configured in the repo.

---

# 42. AGENTS.md Requirements

Create an `AGENTS.md` file instructing future coding agents to preserve:

- TypeScript strictness
- simulation-first architecture
- no backend until explicitly requested
- no real LLM calls
- reusable component architecture
- mock data consistency
- traceability integrity
- accessible UI
- design system consistency
- tests for critical state changes
- no invented business claims

---

# 43. Implementation Phases

Do not try to build the entire product in one uncontrolled pass.

## Phase 1 — Foundation

Build:

- Vite React TypeScript project
- Tailwind
- shadcn/ui setup
- routing
- theme
- AppShell
- sidebar
- top bar
- demo store
- type definitions
- canonical mock data

Acceptance:

- app runs
- routes work
- shell responsive
- lint/build pass

---

## Phase 2 — Overview

Build:

- hero
- workflow timeline
- metrics
- differentiation cards
- Start Demo action

Acceptance:

- user understands idea in < 30 seconds

---

## Phase 3 — Live Session

Build:

- simulated transcript
- speaker states
- live requirement detection panel
- event-driven animation

Acceptance:

- running demo visibly converts conversation into requirements

---

## Phase 4 — Requirement Intelligence + Clarifications

Build:

- readiness
- filters
- requirement drawer
- clarification center
- resolution animation

Acceptance:

- ambiguity is clearly differentiated from confirmed requirements

---

## Phase 5 — POC Scope

Build:

- Included / Mocked / Out-of-Scope board
- reasons
- linked requirements
- approval gate
- baseline lock

Acceptance:

- viewer understands Convo2POC chooses a POC boundary rather than building everything

---

## Phase 6 — Generation Command Center

Build:

- agent graph
- agent states
- activity log
- artifact list
- overall progress
- build pipeline

Acceptance:

- visually communicates controlled orchestration

---

## Phase 7 — POC Preview

Build:

- build result summary
- embedded mini service-request application
- requirement evidence panel

Acceptance:

- user can interact with a believable generated POC

---

## Phase 8 — Traceability

Build:

- traceability graph
- node details
- requirement mapping health

Acceptance:

- viewer can trace at least one transcript statement all the way to a test

---

## Phase 9 — Client Feedback / POC v2

Build:

- feedback transcript
- change detection
- impact panel
- approve change
- version timeline

Acceptance:

- clear POC v1 → v2 story

---

## Phase 10 — Value Report

Build:

- Time-to-POC
- engagement metrics
- conceptual process comparison
- value pillars
- replay CTA

Acceptance:

- demo ends with a business-value story, not code

---

## Phase 11 — Polish

Perform:

- responsive QA
- accessibility review
- animation polish
- copy cleanup
- design consistency
- test fixes
- build optimization

---

# 44. Definition of Done

The project is complete when:

- all required routes exist
- app can run fully from mock local data
- Run Demo drives the storyline
- Pause / Resume / Reset work
- user can manually navigate all screens
- live session progressively reveals requirements
- clarification is detected and resolved
- POC scope can be approved
- generation command center completes
- mock generated POC is interactive
- traceability graph works
- client feedback produces POC v2
- Value Report is populated
- no backend is required
- no API keys are required
- build succeeds
- lint succeeds
- critical tests pass
- README is complete
- AGENTS.md exists

---

# 45. Explicit Non-Goals

Do not spend time on:

- production authentication
- live Teams APIs
- OAuth
- real client identity
- production databases
- deployment to cloud
- actual code generation agents
- actual LLM model routing
- real source code repositories
- actual container execution
- production security scanning
- enterprise SSO
- RBAC beyond illustrative UI
- billing
- multi-tenancy
- mobile-native application

These are roadmap items, not vision-prototype requirements.

---

# 46. Future Integration Points

Architect the code so these can later replace mocks:

```text
Mock Transcript
→ Teams / microphone / uploaded audio

Mock Requirement Events
→ LLM requirement intelligence API

Mock Clarifications
→ Clarification agent

Mock Scope
→ POC scope agent

Mock Agent Orchestration
→ Real workflow engine

Mock Generated POC
→ Generated repository + sandbox deployment

Mock Traceability
→ Real artifact graph

Mock Metrics
→ Real engagement telemetry
```

Do not implement these now.

---

# 47. Product Story the Demo Must Communicate

By the end of the demo, the viewer should be able to explain:

> A client speaks naturally about a business problem. Convo2POC structures the conversation into requirements, identifies missing information instead of silently guessing, proposes a focused POC scope, asks for human approval, orchestrates generation and validation, provides a working prototype with requirement traceability, captures client feedback, identifies change impact, and produces a new POC version. The key value is reducing Time-to-POC while preserving control, clarity, and traceability.

If the app does not communicate this clearly, the implementation is not finished.

---

# 48. Codex Working Instructions

Before coding:

1. Inspect the repository.
2. Create an implementation plan.
3. Identify required dependencies.
4. Establish domain types and mock data first.
5. Build in phases.
6. After each major phase:
   - run type checking
   - run lint
   - run relevant tests
   - run build if appropriate
7. Fix issues before moving on.
8. Keep the app runnable throughout development.
9. Do not remove requirements from this specification without explicit approval.
10. When making a design decision not covered here, choose the option that best supports:
   - clarity
   - enterprise credibility
   - demo reliability
   - maintainability

---

# 49. First Codex Task

Start by completing **Phase 1 only**.

Do not immediately implement all screens.

For Phase 1:

1. Scaffold the project.
2. Configure the requested stack.
3. Create route placeholders for all pages.
4. Implement the application shell.
5. Define all core domain TypeScript types.
6. Create canonical scenario/mock data.
7. Create the initial Zustand demo store.
8. Create the simulation-event type system.
9. Add a minimal `AGENTS.md`.
10. Add a professional README skeleton.
11. Run lint, tests, and build.
12. Report:
    - files created
    - dependencies added
    - commands run
    - remaining Phase 1 concerns

Stop after Phase 1 and wait for review.

Do not start Phase 2 until explicitly instructed.

---

# 50. Final Quality Bar

The final SPA should feel like a product that could credibly be shown to:

- an innovation review board
- a presales leadership team
- an enterprise architect
- a client workshop team

The user should not need a long explanation before understanding the concept.

The UI itself must tell the story.

The most important success test is:

> **Can a stakeholder see the SPA for five minutes and understand why Convo2POC is more than voice-to-code?**

If yes, the prototype has succeeded.
