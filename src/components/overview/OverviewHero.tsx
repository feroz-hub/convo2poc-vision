import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  FileCheck2,
  LockKeyhole,
  Quote,
  Check,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
export function OverviewHero({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion();
  const evidence = requirements.find(
    (requirement) => requirement.id === 'FR-003',
  );
  const source = transcript.find(
    (message) => message.id === evidence?.sourceMessageId,
  );
  const explore = () => {
    const workflow = document.getElementById('workflow');
    workflow?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    workflow?.focus({ preventScroll: true });
  };
  return (
    <section className="overview-hero" aria-labelledby="overview-title">
      <div className="hero-grid" aria-hidden="true" />
      <motion.div
        className="hero-copy"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="hero-label">
          <span />
          Enterprise Conversation-to-POC Platform
        </div>
        <h1 id="overview-title">
          Turn client conversations into <span>validated working POCs</span>
        </h1>
        <p>
          Convo2POC captures requirements, resolves ambiguity, defines the right
          POC scope, orchestrates AI-assisted generation, validates the result,
          and preserves end-to-end traceability.
        </p>
        <div className="hero-actions">
          <Button onClick={onStart} size="lg">
            Start Demo
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" onClick={explore}>
            Explore Workflow
            <ArrowDown size={16} aria-hidden="true" />
          </Button>
        </div>
        <div className="hero-footnote">
          <LockKeyhole size={13} aria-hidden="true" />
          Human-governed · Synthetic data
          <span className="hero-prototype">Vision Prototype</span>
        </div>
      </motion.div>
      <div
        className="hero-signal"
        aria-label="Illustrative conversation-to-requirement transformation"
      >
        <div className="signal-heading">
          <AudioLines size={16} />
          <span>FROM BUSINESS INTENT</span>
          <small>SCENARIO PREVIEW</small>
        </div>
        <div className="signal-quote">
          <Quote size={18} aria-hidden="true" />
          <p>“{source?.text}”</p>
          <span>Client conversation · {source?.timestamp}</span>
        </div>
        <div className="signal-connector" aria-hidden="true">
          <span />
          <ArrowDown size={16} />
          <span />
        </div>
        <div className="signal-record">
          <div>
            <FileCheck2 size={18} />
            <span>STRUCTURED REQUIREMENT</span>
            <code>{evidence?.id}</code>
          </div>
          <strong>{evidence?.title}</strong>
          <p>{evidence?.description}</p>
          <div className="signal-tags">
            <span>
              <Check size={12} />
              Source linked
            </span>
            <span>
              <LockKeyhole size={12} />
              Approval required
            </span>
          </div>
        </div>
        <div className="signal-output">
          <span />
          Evidence preserved through every handoff
          <ArrowRight size={14} />
        </div>
      </div>
    </section>
  );
}
