import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  UsersRound,
  ListChecks,
  Scale,
  Shield,
  FileQuestion,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { scenario } from '@/data/scenario';
import { requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { useDemoStore } from '@/store/demoStore';
import { selectRequirementSummary } from '@/store/requirementSelectors';
export function RequirementModelVisual() {
  const state = useDemoStore();
  const summary = selectRequirementSummary(state);
  const categories = [
    { label: 'Actors', count: summary.actors, Icon: UsersRound, type: 'all' },
    {
      label: 'Functional',
      count: summary.functional,
      Icon: ListChecks,
      type: 'functional',
    },
    {
      label: 'Business rules',
      count: summary.rules,
      Icon: Scale,
      type: 'business-rule',
    },
    {
      label: 'Non-functional',
      count: summary.nonFunctional,
      Icon: Shield,
      type: 'non-functional',
    },
    {
      label: 'Assumptions',
      count: summary.assumptions,
      Icon: Lightbulb,
      type: 'assumption',
    },
    {
      label: 'Open questions',
      count: summary.questions,
      Icon: FileQuestion,
      type: 'open-question',
    },
  ] as const;
  const source = transcript.find(
    (m) =>
      m.id === requirements.find((r) => r.id === 'FR-001')!.sourceMessageId,
  )!;
  return (
    <section className="ri-model" aria-labelledby="ri-model-title">
      <header>
        <BrainCircuit size={20} aria-hidden="true" />
        <div>
          <span className="ri-kicker">Conversation → Structured model</span>
          <h2 id="ri-model-title">One conversation. Connected intelligence.</h2>
        </div>
        <Link to="/session">View Live Session ↗</Link>
      </header>
      <div className="ri-context">
        <div>
          <span>Business problem</span>
          <p>{scenario.businessProblem}</p>
        </div>
        <div>
          <span>Client objective</span>
          <p>{scenario.objective}</p>
        </div>
      </div>
      <div className="ri-model-nodes" aria-label="Structured requirement model">
        {categories.map(({ label, count, Icon, type }) => (
          <button
            key={label}
            onClick={() =>
              state.setRequirementView({
                type,
                actor: null,
                status: 'all',
                search: '',
              })
            }
          >
            <Icon size={19} aria-hidden="true" />
            <strong>{count}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div
        className="ri-transformation"
        aria-label="Conversation to structured requirements example"
      >
        <div>
          <span className="ri-kicker">
            Raw conversation · {source.timestamp}
          </span>
          <blockquote>“{source.text}”</blockquote>
          <small>Recorded workshop example · {source.id}</small>
        </div>
        <ArrowRight size={24} aria-hidden="true" />
        <div>
          <span className="ri-kicker">Structured intelligence</span>
          {['FR-001', 'FR-002'].map((id) => (
            <Link key={id} to={`/requirements?selected=${id}`}>
              <code>{id}</code>
              {requirements.find((r) => r.id === id)!.description}
            </Link>
          ))}
          <small>
            Actor:{' '}
            {requirements.find((r) => r.id === 'FR-001')!.actors.join(' · ')}
          </small>
        </div>
      </div>
    </section>
  );
}
