import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Clock3,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectValueReport } from '@/store/valueSelectors';
import { scenario } from '@/data/scenario';
import { clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import {
  feedbackMessages,
  requirementRevisions,
} from '@/data/feedbackEvolution';
import { useDemoTarget } from '@/components/demo/demoTargets';
import {
  ValueSection,
  ValueMetrics,
  ValueFlow,
  ValueCheck,
} from '@/components/value/ValuePrimitives';
import '@/styles/value.css';
const pilotKpis = [
  'Time-to-POC',
  'Human engineering effort per POC',
  'Clarification questions identified before implementation',
  'Requirement rework rate',
  'Requirement source-traceability coverage',
  'Successful generated-build rate',
  'Validation/test success rate',
  'Artifact reuse rate',
  'Feedback-to-v2 turnaround time',
  'Consultant satisfaction',
  'Client workshop feedback',
];
const measurement = 'Illustrative demo measurement';
const duration = (ms: number | null) =>
  ms === null
    ? 'Pending'
    : `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
export function ValueReportPage() {
  const s = useDemoStore(),
    r = selectValueReport(s);
  const hero = useDemoTarget('value-time-to-poc');
  const q = clarifications.find((q) => q.id === 'OQ-001')!;
  const source = transcript.find((m) => m.id === q.sourceMessageId)!;
  const answer = transcript.find((m) => m.id === q.resolutionMessageId)!;
  const reviewed = s.resolvedClarificationIds.includes(q.id);
  const change = r.impactAvailable;
  const versions = [
    s.pocBaseline?.id ?? 'RB-001 pending',
    r.v2Ready ? 'POC v1 preserved' : 'POC v1',
    r.changeCaptured ? 'CR-001' : 'CR-001 pending',
    s.feedback.baseline?.id ?? 'RB-002 pending',
    r.v2Ready ? 'POC v2 ready for review' : 'POC v2 pending',
  ];
  const journey = [
    ['Discovery', s.sessionComplete],
    [
      'Requirement Intelligence',
      r.requirements.captured === r.requirements.total,
    ],
    ['Clarification', r.clarification.resolved === clarifications.length],
    ['POC Scope', !!s.pocBaseline],
    ['RB-001', !!s.pocBaseline],
    ['AI Generation', r.generation.humanReviewReady],
    ['Validation', r.generation.humanReviewReady],
    ['POC v1', r.generation.humanReviewReady],
    [
      'Traceability',
      r.trace.features > 0 && r.trace.features === r.trace.featuresTotal,
    ],
    ['Client Review', !!s.pocRuntime.approval],
    ['CR-001', r.changeCaptured],
    ['Impact Analysis', change],
    ['RB-002', !!s.feedback.baseline],
    ['Targeted Regeneration', r.v2Ready],
    ['POC v2', r.v2Ready],
  ] as const;
  return (
    <div className="value-page page-content">
      <header className="value-hero" {...hero}>
        <div>
          <span className="value-kicker">
            <Sparkles size={16} /> CONVO2POC · EXECUTIVE OUTCOME
          </span>
          <h1>Value Creation Report</h1>
          <h2>From client conversation to validated POC evolution.</h2>
          <p>
            Convo2POC transforms client conversations into governed, traceable
            working prototypes and controlled iterations.
          </p>
          <span className="value-status">
            <ShieldCheck size={16} />
            {r.status}
          </span>
        </div>
        <div className="value-time">
          <span>TIME-TO-POC</span>
          <strong>{duration(r.timeToPocMs)}</strong>
          <p>Client discovery → POC v1 ready for human review</p>
          <small>{measurement}</small>
          <hr />
          <span>Feedback-to-POC-v2</span>
          <b>{duration(r.feedbackToV2Ms)}</b>
          <small>{measurement}</small>
        </div>
        <div className="value-context">
          <span>{scenario.engagement}</span>
          <span>{scenario.client}</span>
          <span>Initial: {s.pocBaseline?.id ?? 'Not approved'}</span>
          <span>
            Latest:{' '}
            {s.feedback.baseline?.id ?? s.pocBaseline?.id ?? 'Not approved'}
          </span>
          <span>{r.versions} review-ready POC versions</span>
        </div>
      </header>
      <ValueMetrics
        items={[
          ['Structured records', r.requirements.total],
          ['Captured', r.requirements.captured],
          [
            'Clarifications governed',
            `${r.clarification.resolved} / ${clarifications.length}`,
          ],
          ['Capabilities assessed', r.scope.total],
          ['Included in POC', r.scope.included],
          [
            'Validated artifacts',
            Object.values(s.generation.artifactStatuses).filter(
              (v) => v === 'validated',
            ).length,
          ],
        ]}
      />
      <p className="value-note">
        <Clock3 size={15} /> Active compressed simulation time; human review
        time is untimed. These are not engagement wall-clock measurements or
        presentation duration.
      </p>
      <ValueSection
        eyebrow="ONE GOVERNED DIGITAL THREAD"
        title="Client intent stays connected to working proof"
      >
        <ol className="value-journey">
          {journey.map(([label, done], i) => (
            <li key={label}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{label}</b>
              <small>{done ? 'Available' : 'Pending'}</small>
            </li>
          ))}
        </ol>
        <div className="value-pillars">
          {[
            [
              'Faster Time-to-POC',
              duration(r.timeToPocMs),
              'Illustrative demo measurement; a hypothesis for real pilots.',
            ],
            [
              'Earlier Requirement Clarification',
              `${r.clarification.resolved} / ${clarifications.length}`,
              'Surface ambiguity before implementation.',
            ],
            [
              'Controlled POC Scope',
              `${r.scope.included} included`,
              'Prove the core workflow within an approved boundary.',
            ],
            [
              'Governed AI Engineering',
              `${r.gatesCompleted} gates`,
              'Human review controls progression and delivery.',
            ],
            [
              'End-to-End Traceability',
              `${r.trace.features} / ${r.trace.featuresTotal}`,
              'Scoped workflows connected to evidence.',
            ],
            [
              'Efficient Change Reuse',
              change ? `${r.reusePercent.toFixed(1)}%` : 'Pending',
              'Illustrative demo measurement of reusable assets.',
            ],
          ].map(([title, value, text]) => (
            <article key={title}>
              <ArrowUpRight size={22} />
              <h3>{title}</h3>
              <strong>{value}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </ValueSection>
      <div className="value-grid">
        <ValueSection
          target="value-requirements"
          eyebrow="01 · STRUCTURED CLIENT INTENT"
          title="A model, not meeting notes"
        >
          <ValueMetrics
            items={[
              ['Functional', r.requirements.functional],
              ['Business rules', r.requirements.rules],
              ['Non-functional', r.requirements.nonFunctional],
              ['Assumptions', r.requirements.assumptions],
              ['Open questions', r.requirements.questions],
              ['Actors', r.requirements.actors],
              ['Confirmed', r.requirements.confirmed],
              ['Requirement readiness', `${r.readiness}%`],
            ]}
          />
          <ValueFlow
            items={[
              'Conversation evidence',
              'Typed requirements',
              'Confidence + review',
              'Baseline input',
            ]}
          />
          <p>
            {r.requirements.traceable} / {r.requirements.total} records have
            canonical conversation or scenario-brief references. Capture and
            consultant confirmation remain separate.
          </p>
          <Link to="/requirements">Review Requirement Intelligence →</Link>
        </ValueSection>
        <ValueSection
          eyebrow="02 · AMBIGUITY REMOVED"
          title="Evidence replaces an AI guess"
        >
          <div className="value-evidence">
            <small>AMBIGUOUS · {source.timestamp}</small>
            <blockquote>“{source.text}”</blockquote>
            <p>{q.reason}</p>
            <small>AI-SUGGESTED CLARIFICATION</small>
            <blockquote>“{q.question}”</blockquote>
            <small>
              CLIENT EVIDENCE · {answer.timestamp} ·{' '}
              {s.visibleTranscriptMessageIds.includes(answer.id)
                ? 'Captured'
                : 'Capture pending'}
            </small>
            <blockquote>“{answer.text}”</blockquote>
          </div>
          <ValueFlow items={[q.id, ...q.affectedRequirementIds]} />
          <p>
            {reviewed ? 'Consultant confirmed' : 'Consultant review pending'} ·
            Shared readiness: {r.clarificationReadiness.before}% →{' '}
            {r.clarificationReadiness.after}% if confirmed. Illustrative
            readiness model.
          </p>
          <Link to="/clarifications?selected=OQ-001">
            Review clarification evidence →
          </Link>
        </ValueSection>
      </div>
      <ValueSection
        target="value-scope"
        eyebrow="03 · DELIBERATE POC BOUNDARY"
        title="Reduce scope without losing client intent"
      >
        <div className="value-scope">
          <div className="value-full">
            <strong>{r.scope.total}</strong>
            <span>Full client vision</span>
            <small>Capabilities assessed</small>
          </div>
          <div className="value-scope-arrow">
            →
            <small>
              Scope intelligence
              <br />+ consultant review
            </small>
          </div>
          <ValueMetrics
            items={[
              ['Included', r.scope.included],
              ['Mocked dependencies', r.scope.mocked],
              ['Deferred', r.scope.excluded],
            ]}
          />
        </div>
        <div className="value-bars" aria-label="Scope distribution">
          {[
            ['Included', r.scope.included],
            ['Mocked', r.scope.mocked],
            ['Deferred', r.scope.excluded],
          ].map(([label, count]) => (
            <div key={label} style={{ flex: Number(count) }}>
              {label} · {count}
            </div>
          ))}
        </div>
        <ValueMetrics
          items={[
            ['Success criteria covered', r.criteria.length],
            ['Human overrides', r.scope.overrides],
            ['Initial baseline', s.pocBaseline?.id ?? 'Pending'],
            [
              'Scope category changes after CR-001',
              s.feedback.baseline ? r.impact.scopeCategoryChanges : 'Pending',
            ],
          ]}
        />
        <p>
          The smallest governed scope needed to validate the core workflow.
          Mocked identity and deferred enterprise capabilities remain visible.
        </p>
        <Link to="/scope">Review POC scope →</Link>
      </ValueSection>
      <div className="value-grid">
        <ValueSection
          eyebrow="04 · SIMULATED ENGINEERING GENERATION EVIDENCE"
          title="A reviewable prototype from an approved contract"
        >
          <ValueMetrics
            items={[
              ['Logical engineering agents', s.agentStatuses.length],
              ['Agents completed', r.generation.complete],
              ['Generated artifacts', r.generation.artifacts],
              [
                'Mapped tests/checks',
                `${r.generation.testsPassed} / ${r.generation.testsTotal}`,
              ],
              ['Build checks', s.buildChecks.length],
              ['Sandbox', s.generation.sandbox],
            ]}
          />
          <ValueFlow
            items={[
              'RB-001',
              'Architecture',
              'UI + Backend + Data',
              'Tests',
              'Security',
              'Sandbox',
              'POC v1',
            ]}
          />
          <Link to="/generation">Review simulated generation evidence →</Link>
        </ValueSection>
        <ValueSection
          eyebrow="05 · VALIDATION"
          title="Evidence before demonstration"
        >
          <ul className="value-checks">
            {s.buildChecks.map((c) => (
              <li className="value-check" key={c.id}>
                <ShieldCheck size={17} />
                <span>{c.label}</span>
                <b>{c.status.toUpperCase()}</b>
              </li>
            ))}
          </ul>
          <p>
            Simulated validation evidence; no production certification or
            external deployment.
          </p>
          <Link to="/preview?version=v1">Open POC v1 review →</Link>
        </ValueSection>
      </div>
      <ValueSection
        target="value-traceability"
        eyebrow="06 · NOTHING IMPORTANT IS A MYSTERIOUS INVENTION"
        title="Scoped POC Core Workflow Traceability"
      >
        <ValueMetrics
          items={[
            [
              'Scoped core workflows traced',
              `${r.trace.features} / ${r.trace.featuresTotal}`,
            ],
            ['Overall scoped coverage', `${r.trace.coverage}%`],
            ['Mapped passing checks', r.mappedPassingChecks],
            ['Unmapped scoped items', r.trace.unmapped],
            [
              'Source chains captured',
              `${r.trace.sources} / ${r.trace.featuresTotal}`,
            ],
          ]}
        />
        <ValueFlow
          items={[
            'Client statement',
            'OQ-001',
            'FR-007 / BR-003',
            'Included scope',
            'Generated artifacts',
            'P1 approval feature',
            'Test evidence',
          ]}
        />
        <p>
          Coverage applies to the approved scoped POC workflows.{' '}
          {r.scope.mocked} mocked and {r.scope.excluded} deferred capabilities
          are disclosed separately, outside the scoped-core denominator.
        </p>
        <Link to="/traceability?feature=approval">Review Traceability →</Link>
      </ValueSection>
      <ValueSection
        eyebrow="07 · HUMAN GOVERNANCE"
        title="AI assists. People control the baseline."
      >
        <ValueFlow items={['AI assists', 'Human reviews', 'AI continues']} />
        <ValueMetrics
          items={[
            ['Completed governance gates', r.gatesCompleted],
            ['Automatic client delivery', 'Never'],
            ['Production deployment', 'Never'],
          ]}
        />
        <ul className="value-checks value-gates">
          {r.gates.map((g) => (
            <ValueCheck key={g.label} done={g.done}>
              {g.label}
            </ValueCheck>
          ))}
        </ul>
        <p>
          A gate is a blocking workflow decision, not a button click. Each
          clarification confirmation is one gate. Autopilot automates
          presentation only. Product governance remains human-controlled; guided
          approvals are explicitly simulated.
        </p>
      </ValueSection>
      <ValueSection
        target="value-version-evolution"
        eyebrow="08 · CLIENT FEEDBACK → CONTROLLED EVOLUTION"
        title="Change the policy. Preserve the original proof."
      >
        <blockquote className="value-client">
          “{feedbackMessages[1].text}”{' '}
          <small>
            Client review · {feedbackMessages[1].timestamp} ·{' '}
            {r.changeCaptured ? 'CR-001 detected' : 'Feedback pending'}
          </small>
        </blockquote>
        <div className="value-policy">
          <article>
            <span>POC v1 · RB-001</span>
            <h3>P1 requires approval</h3>
            <p>P2 can proceed without manager approval.</p>
          </article>
          <GitBranch size={30} />
          <article>
            <span>
              POC v2 · {s.feedback.baseline?.id ?? 'Baseline pending'}
            </span>
            <h3>{requirementRevisions[0]!.revisedText}</h3>
            <p>
              {r.v2Ready
                ? 'Ready for human review'
                : 'Targeted implementation pending'}{' '}
              ·{' '}
              {s.feedback.v2Runtime?.approval
                ? 'Consultant approved'
                : 'Consultant approval pending'}
            </p>
          </article>
        </div>
        <ValueFlow items={versions} />
        <ValueMetrics
          items={[
            [
              'Requirement revisions',
              change ? requirementRevisions.length : 'Pending',
            ],
            [
              'Scope items affected',
              change ? r.impact.scopeItemIds.length : 'Pending',
            ],
            [
              'Architecture artifacts modified',
              change ? r.impact.architectureChanges.length : 'Pending',
            ],
            ['Regeneration strategy', change ? 'Targeted' : 'Pending'],
          ]}
        />
        <Link to="/feedback">Review Client Change →</Link>
      </ValueSection>
      <div className="value-grid">
        <ValueSection
          target="value-reuse"
          eyebrow="09 · TARGETED REGENERATION"
          title="Changed where needed. Reused where valid."
        >
          <ValueMetrics
            items={[
              ['Artifacts reused', change ? r.impact.reused.length : 'Pending'],
              [
                'Artifacts modified',
                change ? r.impact.modified.length : 'Pending',
              ],
              [
                'Artifact Reuse Rate',
                change ? `${r.reusePercent.toFixed(1)}%` : 'Pending',
              ],
            ]}
          />
          <small>{measurement}</small>
          {change && (
            <div
              className="value-bars value-reuse"
              aria-label={`Artifact reuse: ${r.impact.reused.length} reused, ${r.impact.modified.length} modified`}
            >
              <div style={{ flex: r.impact.reused.length }}>
                Reused · {r.impact.reused.length}
              </div>
              <div style={{ flex: r.impact.modified.length }}>
                Modified · {r.impact.modified.length}
              </div>
            </div>
          )}
          <p>
            Reused ÷ (reused + modified). Only baseline assets relevant to
            CR-001 impact analysis; this measures artifacts, not saved
            engineering effort.
          </p>
          <details>
            <summary>Inspect changed and reused assets</summary>
            <h3>Modified</h3>
            <ul>
              {r.impact.modified.map((a) => (
                <li key={a.id}>{a.label}</li>
              ))}
            </ul>
            <h3>Reused</h3>
            <ul>
              {r.impact.reused.map((a) => (
                <li key={a.id}>{a.label}</li>
              ))}
            </ul>
          </details>
        </ValueSection>
        <ValueSection
          eyebrow="10 · VERSIONED TEST EVIDENCE"
          title="A changed rule keeps its historical result"
        >
          <ValueMetrics
            items={[
              [
                'TC-023 · v1 P2 without approval',
                s.generation.testResults['TC-023']?.toUpperCase() ?? 'Pending',
              ],
              [
                'TC-016 · v2 P2 requires approval',
                s.feedback.delta.testResults['TC-016']?.toUpperCase() ??
                  'Pending',
              ],
              [
                'POC v2 checks',
                `${r.impact.v2Tests.filter((t) => s.feedback.delta.testResults[t.id] === 'passed').length} / ${r.impact.v2Tests.length}`,
              ],
            ]}
          />
          <p>
            TC-016 supersedes TC-023 for RB-002. The RB-001 result remains
            preserved. A ready v2 is still subject to consultant review.
          </p>
          <Link to="/preview?version=v2">Open POC v2 →</Link>
        </ValueSection>
      </div>
      <ValueSection
        eyebrow="VALUE HYPOTHESES · TO VALIDATE IN REAL PILOTS"
        title="A more connected presales workflow"
      >
        <div className="value-grid">
          <article>
            <h3>Potential HCLTech value</h3>
            <p>
              Earlier requirement validation, less interpretation loss, reusable
              POC assets, consistent governance and evidence for presales
              handoffs.
            </p>
          </article>
          <article>
            <h3>Potential client value</h3>
            <p>
              Clearer workshop decisions, visible prototype boundaries,
              reviewable working proof and controlled feedback turnaround.
            </p>
          </article>
        </div>
        <h3>Conceptual process comparison</h3>
        <p>Traditional current workflow</p>
        <ValueFlow
          items={[
            'Conversation',
            'Notes',
            'Requirement handoff',
            'Architecture',
            'Development',
            'Testing',
            'Demo',
          ]}
        />
        <p>Convo2POC-assisted workflow</p>
        <ValueFlow
          items={[
            'Conversation',
            'Structured requirements',
            'Clarify',
            'Approved scope',
            'Generate',
            'Validate',
            'Demo',
          ]}
        />
        <div className="value-pillars">
          {[
            [
              'Problem',
              'Repeated translation between conversation, requirements, engineering and feedback.',
            ],
            [
              'Idea',
              'A governed digital thread from conversation to working proof.',
            ],
            [
              'Validation approach',
              'Compare suitable real presales engagements before claiming business gains.',
            ],
          ].map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </ValueSection>
      <ValueSection
        target="value-pilot"
        eyebrow="PROPOSED PILOT KPIs"
        title="How We Would Validate Real Value"
      >
        <div className="value-kpis">
          {pilotKpis.map((kpi) => (
            <article key={kpi}>
              <h3>{kpi}</h3>
              <dl>
                <div>
                  <dt>Baseline</dt>
                  <dd>To be measured</dd>
                </div>
                <div>
                  <dt>Pilot result</dt>
                  <dd>To be measured</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <div className="value-pilot">
          <Sparkles size={28} />
          <div>
            <span className="value-kicker">
              PILOT CONVO2POC · RECOMMENDATION
            </span>
            <h3>5–10 suitable internal / presales POC engagements</h3>
            <p>
              Compare the current workflow with Convo2POC-assisted delivery.
              Measure time, effort, rework, clarity, traceability, build/test
              success, reuse and feedback turnaround. Pilot approval remains a
              future decision.
            </p>
          </div>
        </div>
      </ValueSection>
      <ValueSection
        target="value-summary"
        eyebrow="CONVO2POC — DEMO OUTCOME"
        title="Conversation to working proof, with control intact"
      >
        <ValueMetrics
          items={[
            [
              'Structured records',
              `${r.requirements.captured} / ${r.requirements.total}`,
            ],
            [
              'Clarifications governed',
              `${r.clarification.resolved} / ${clarifications.length}`,
            ],
            ['Capabilities assessed', r.scope.total],
            ['Included in POC', r.scope.included],
            ['Generated artifacts', r.generation.artifacts],
            [
              'Scoped workflows traced',
              `${r.trace.features} / ${r.trace.featuresTotal}`,
            ],
            ['Artifacts reused', change ? r.impact.reused.length : 'Pending'],
            [
              'Versioned baselines',
              `${s.pocBaseline?.id ?? 'Pending'} → ${s.feedback.baseline?.id ?? 'Pending'}`,
            ],
            ['Controlled evolution', r.v2Ready ? 'POC v1 → POC v2' : 'Pending'],
            ['Human governance', 'Maintained'],
          ]}
        />
        <h3>Quality / governance completion</h3>
        <ul className="value-checks value-gates">
          {[
            [
              'Requirements structured',
              r.requirements.captured === r.requirements.total,
            ],
            [
              'Clarifications resolved',
              r.clarification.resolved === clarifications.length,
            ],
            ['Scope approved', !!s.pocBaseline],
            [
              'Success criteria mapped',
              !!s.pocBaseline &&
                r.criteria.every((c) =>
                  r.impact.v1Tests.some((t) => t.successCriterionId === c.id),
                ),
            ],
            ['POC generated', r.generation.complete === s.agentStatuses.length],
            ['Validation passed', r.generation.humanReviewReady],
            [
              'Security baseline passed',
              s.buildChecks.some(
                (c) => c.id === 'security' && c.status === 'passed',
              ),
            ],
            [
              'Scoped workflow traceability complete',
              r.trace.featuresTotal > 0 &&
                r.trace.features === r.trace.featuresTotal,
            ],
            ['Client change versioned', !!s.feedback.baseline],
            [
              'Historical evidence preserved',
              r.v2Ready && s.generation.testResults['TC-023'] === 'passed',
            ],
            ['Human governance maintained', true],
          ].map(([label, done]) => (
            <ValueCheck key={String(label)} done={Boolean(done)}>
              {label}
            </ValueCheck>
          ))}
        </ul>
        <p>
          Metrics shown are derived from the deterministic Convo2POC vision
          prototype and are illustrative. Real business value must be validated
          through pilot engagements.
        </p>
        <small>
          Internal Concept Prototype · Not an approved production product
        </small>
      </ValueSection>
      <footer className="value-final">
        <h2>From conversation to demonstrable value.</h2>
        <nav aria-label="Value report next actions">
          <button onClick={s.restartFullDemo}>Replay Full Demo</button>
          <Link to="/preview?version=v2">Open POC v2</Link>
          <Link to="/traceability">Review Traceability</Link>
          <Link to="/feedback">Review Client Change</Link>
          <button onClick={s.exitFullDemo}>Explore Manually</button>
          <button disabled={s.director.mode === 'autopilot'} onClick={s.reset}>
            Reset Scenario
          </button>
        </nav>
      </footer>
    </div>
  );
}
