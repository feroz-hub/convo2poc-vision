import type { CSSProperties } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { workflowStages } from '@/data/overview';
export function WorkflowJourney() {
  return (
    <section
      id="workflow"
      className="overview-section workflow-section"
      tabIndex={-1}
      aria-labelledby="workflow-title"
    >
      <div className="overview-section-heading">
        <div>
          <span className="section-kicker">THE END-TO-END JOURNEY</span>
          <h2 id="workflow-title">
            From a conversation to a solution you can review
          </h2>
        </div>
        <span className="section-aside">
          Understand · Govern · Engineer · Prove
        </span>
      </div>
      <ol className="workflow-ribbon">
        {workflowStages.map((stage, index) => (
          <WorkflowStageNode key={stage.id} stage={stage} index={index} />
        ))}
      </ol>
      <div className="workflow-governance">
        <span>
          <LockKeyhole size={14} aria-hidden="true" />
          Human approval before generation
        </span>
        <span>Client feedback → reviewed impact → POC v2</span>
      </div>
    </section>
  );
}

export function WorkflowStageNode({
  stage,
  index,
}: {
  stage: (typeof workflowStages)[number];
  index: number;
}) {
  const Icon = stage.icon;
  return (
    <li
      className={`workflow-step workflow-${stage.group.toLowerCase()}`}
      style={{ '--rail-delay': `${index * 1.5}s` } as CSSProperties}
    >
      <span className="workflow-index">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="workflow-node">
        <Icon size={21} aria-hidden="true" />
      </div>
      <h3>{stage.title}</h3>
      <p>{stage.phrase}</p>
      {index < workflowStages.length - 1 && (
        <ArrowRight className="workflow-arrow" size={14} aria-hidden="true" />
      )}
    </li>
  );
}
