import { ArrowDown, ArrowRight, LockKeyhole } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function HeroCopy({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion();
  const explore = () => {
    const workflow = document.getElementById('workflow');
    workflow?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    workflow?.focus({ preventScroll: true });
  };
  return (
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
      <p>From conversation to clarity to working prototype.</p>
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
  );
}
