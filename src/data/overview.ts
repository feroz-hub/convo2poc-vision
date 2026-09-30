import {
  AudioLines,
  ListChecks,
  MessageCircleQuestion,
  Layers,
  WandSparkles,
  ShieldCheck,
  Monitor,
  GitBranch,
  BrainCircuit,
  ScanSearch,
  LockKeyhole,
} from 'lucide-react';
export const workflowStages = [
  {
    id: 'conversation',
    title: 'Listen',
    phrase: 'Capture the business need',
    icon: AudioLines,
    group: 'Understand',
  },
  {
    id: 'requirements',
    title: 'Understand',
    phrase: 'Structure the signals',
    icon: ListChecks,
    group: 'Understand',
  },
  {
    id: 'clarify',
    title: 'Clarify',
    phrase: 'Resolve what is uncertain',
    icon: MessageCircleQuestion,
    group: 'Understand',
  },
  {
    id: 'scope',
    title: 'Scope',
    phrase: 'Approve a focused baseline',
    icon: Layers,
    group: 'Govern',
  },
  {
    id: 'generate',
    title: 'Generate',
    phrase: 'Orchestrate AI assistance',
    icon: WandSparkles,
    group: 'Engineer',
  },
  {
    id: 'validate',
    title: 'Validate',
    phrase: 'Build, test, and review',
    icon: ShieldCheck,
    group: 'Engineer',
  },
  {
    id: 'demo',
    title: 'Demo',
    phrase: 'Explore a working POC',
    icon: Monitor,
    group: 'Prove',
  },
  {
    id: 'iterate',
    title: 'Iterate',
    phrase: 'Review feedback → v2',
    icon: GitBranch,
    group: 'Prove',
  },
] as const;
export const differentiators = [
  {
    title: 'Requirement Intelligence',
    text: 'Structure business needs directly from conversation.',
    icon: BrainCircuit,
    cue: 'Business intent → structured evidence',
  },
  {
    title: 'Clarification Before Generation',
    text: 'Expose ambiguity instead of silently guessing.',
    icon: MessageCircleQuestion,
    cue: 'Uncertainty → explicit answers',
  },
  {
    title: 'POC Scope Intelligence',
    text: 'Identify the smallest prototype that proves the core workflow.',
    icon: ScanSearch,
    cue: 'Broad ambition → focused scope',
  },
  {
    title: 'Governed Generation',
    text: 'Use approval gates, validation, and controlled generation.',
    icon: LockKeyhole,
    cue: 'Human approval → reviewable output',
  },
  {
    title: 'End-to-End Traceability',
    text: 'Connect conversation → requirement → feature → test.',
    icon: GitBranch,
    cue: 'Every feature → source evidence',
  },
] as const;
export const processComparison = [
  {
    id: 'traditional',
    title: 'Traditional',
    caption: 'Sequential handoffs',
    stages: [
      'Conversation',
      'Notes',
      'Requirement handoff',
      'Architecture',
      'Development',
      'Testing',
      'Demo',
    ],
  },
  {
    id: 'convo2poc',
    title: 'Convo2POC',
    caption: 'One governed workflow',
    stages: [
      'Conversation',
      'Structured Requirements',
      'Clarify',
      'Approved Scope',
      'Generate',
      'Validate',
      'Demo',
    ],
  },
] as const;

export const storyboardFrames = [
  {
    title: 'Client explains',
    caption: 'Email + spreadsheets',
    icon: AudioLines,
    kind: 'conversation',
  },
  {
    title: 'AI structures',
    caption: 'Source-linked requirements',
    icon: ListChecks,
    kind: 'requirements',
  },
  {
    title: 'Ambiguity clarified',
    caption: 'P1 → manager approval',
    icon: MessageCircleQuestion,
    kind: 'clarification',
  },
  {
    title: 'POC generated',
    caption: 'After human approval',
    icon: Monitor,
    kind: 'prototype',
  },
] as const;

// Presentation-only cycle: no demo events, transcript playback, or domain state changes.
export const heroStory = {
  duration: 30,
  speech: 0,
  signal: 2,
  intelligence: 4,
  requirements: 6,
  ambiguity: 9,
  resolved: 12,
  scope: 15,
  prototype: 18,
  validation: 21,
  feedback: 24,
  version: 27,
} as const;
