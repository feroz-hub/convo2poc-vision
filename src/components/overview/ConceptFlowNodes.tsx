import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AudioLines,
  BrainCircuit,
  ListChecks,
  MessageCircleQuestion,
  LockKeyhole,
  Monitor,
  ShieldCheck,
  Check,
  GitBranch,
  GitPullRequestArrow,
} from 'lucide-react';
import { heroStory } from '@/data/overview';
import { requirements } from '@/data/requirements';
function StoryReveal({
  at,
  until = 29,
  children,
  className = '',
}: {
  at: number;
  until?: number;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      animate={reduced ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0, 0] }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              duration: heroStory.duration,
              repeat: Infinity,
              ease: 'linear',
              times: [
                0,
                at / 30,
                (at + 0.4) / 30,
                (until - 0.4) / 30,
                until / 30,
                1,
              ],
            }
      }
    >
      {children}
    </motion.div>
  );
}
function ConceptNode({
  label,
  x,
  y,
  at,
  children,
  detail,
  tone = 'intelligence',
}: {
  label: string;
  x: number;
  y: number;
  at: number;
  children: ReactNode;
  detail?: ReactNode;
  tone?: 'intelligence' | 'governance' | 'proof';
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={`concept-node concept-tone-${tone}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <motion.div
        className="concept-node-face"
        initial={false}
        animate={reduced ? { scale: 1 } : { scale: [1, 1, 1.06, 1, 1] }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                duration: 30,
                repeat: Infinity,
                times: [0, at / 30, (at + 0.6) / 30, 0.98, 1],
              }
        }
      >
        {children}
      </motion.div>
      <span>{label}</span>
      {detail}
    </div>
  );
}
export function ConversationNode() {
  return (
    <ConceptNode
      label="Client conversation"
      x={14}
      y={16}
      at={heroStory.speech}
    >
      <AudioLines size={24} />
      <StoryReveal at={0} until={6} className="speech-bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} />
        ))}
      </StoryReveal>
    </ConceptNode>
  );
}
export function AIHubNode() {
  return (
    <ConceptNode
      label="AI intelligence"
      x={50}
      y={16}
      at={heroStory.intelligence}
    >
      <BrainCircuit size={27} />
      <StoryReveal at={4} className="hub-halo">
        <span />
      </StoryReveal>
    </ConceptNode>
  );
}
export function RequirementCluster() {
  const records = requirements
    .filter((r) => r.type === 'functional')
    .slice(0, 2);
  return (
    <ConceptNode
      label="Requirements"
      x={86}
      y={16}
      at={heroStory.requirements}
      detail={
        <div className="requirement-cluster">
          {records.map((r) => (
            <div key={r.id}>
              <code>{r.id}</code>
              <span>{r.title}</span>
            </div>
          ))}
        </div>
      }
    >
      <ListChecks size={24} />
    </ConceptNode>
  );
}
export function ClarificationNode() {
  const reduced = useReducedMotion();
  return (
    <ConceptNode
      label="Clarification"
      x={86}
      y={52}
      at={heroStory.ambiguity}
      detail={
        <div className="concept-status">
          {!reduced && (
            <StoryReveal at={9} until={12}>
              Ambiguity detected
            </StoryReveal>
          )}
          <StoryReveal at={12}>
            <Check size={10} /> Clarified
          </StoryReveal>
        </div>
      }
    >
      <MessageCircleQuestion size={24} />
    </ConceptNode>
  );
}
export function ScopeNode() {
  return (
    <ConceptNode
      tone="governance"
      label="Approved scope"
      x={50}
      y={52}
      at={heroStory.scope}
      detail={
        <StoryReveal at={15} className="concept-status">
          <Check size={10} /> Human approved
        </StoryReveal>
      }
    >
      <LockKeyhole size={24} />
    </ConceptNode>
  );
}
export function PrototypeNode() {
  const reduced = useReducedMotion();
  return (
    <ConceptNode
      label="Working POC"
      x={14}
      y={52}
      at={heroStory.prototype}
      detail={
        <div className="concept-status">
          {!reduced && (
            <StoryReveal at={18} until={27}>
              POC v1
            </StoryReveal>
          )}
          <StoryReveal at={27}>Approved → POC v2</StoryReveal>
        </div>
      }
    >
      <Monitor size={24} />
    </ConceptNode>
  );
}
export function ValidationNode() {
  return (
    <ConceptNode
      tone="proof"
      label="Validation"
      x={14}
      y={84}
      at={heroStory.validation}
      detail={
        <StoryReveal at={21} className="concept-status">
          <Check size={10} /> Concept validated
        </StoryReveal>
      }
    >
      <ShieldCheck size={24} />
    </ConceptNode>
  );
}
export function FeedbackLoop() {
  const reduced = useReducedMotion();
  return (
    <>
      <ConceptNode
        tone="proof"
        label="Reviewed feedback"
        x={50}
        y={84}
        at={heroStory.feedback}
      >
        <GitBranch size={24} />
      </ConceptNode>
      <ConceptNode
        tone="proof"
        label="POC v2"
        x={86}
        y={84}
        at={heroStory.version}
        detail={<div className="concept-status">Human approval</div>}
      >
        <GitPullRequestArrow size={24} />
      </ConceptNode>
      <svg
        className="concept-connections feedback-path"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M50 84 H86 H96 V16 H92" className="concept-loop-track" />
        <motion.path
          d="M50 84 H86 H96 V16 H92"
          className="concept-loop"
          initial={false}
          animate={
            reduced ? { pathLength: 1 } : { pathLength: [0, 0, 0.18, 1, 1, 0] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 30,
                  repeat: Infinity,
                  times: [0, 0.8, 0.9, 0.95, 0.98, 1],
                }
          }
        />
      </svg>
      <span className="concept-loop-label">Review → approve → v2</span>
    </>
  );
}
