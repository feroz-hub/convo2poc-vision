import {
  LayoutDashboard,
  AudioLines,
  ListChecks,
  MessageCircleQuestion,
  Layers,
  Network,
  Monitor,
  GitBranch,
  MessagesSquare,
  ChartNoAxesCombined,
} from 'lucide-react';
export const routes = [
  {
    path: '/',
    label: 'Overview',
    icon: LayoutDashboard,
    phase: 2,
    description:
      'The executive overview will introduce the governed Conversation-to-POC workflow.',
  },
  {
    path: '/session',
    label: 'Live Session',
    icon: AudioLines,
    phase: 3,
    description:
      'A simulated client conversation will progressively reveal requirement signals.',
  },
  {
    path: '/requirements',
    label: 'Requirement Intelligence',
    icon: ListChecks,
    phase: 4,
    description:
      'Structured requirements, source evidence, and illustrative readiness will appear here.',
  },
  {
    path: '/clarifications',
    label: 'Clarifications',
    icon: MessageCircleQuestion,
    phase: 4,
    description:
      'Review and resolve uncertainty before defining the POC baseline.',
  },
  {
    path: '/scope',
    label: 'POC Scope',
    icon: Layers,
    phase: 5,
    description:
      'Review included, mocked, and excluded capabilities before human approval.',
  },
  {
    path: '/generation',
    label: 'Generation',
    icon: Network,
    phase: 6,
    description:
      'Simulated agents and validation checks will follow the approved requirement baseline.',
  },
  {
    path: '/preview',
    label: 'POC Preview',
    icon: Monitor,
    phase: 7,
    description:
      'An interactive service request prototype will be available after simulated validation.',
  },
  {
    path: '/traceability',
    label: 'Traceability',
    icon: GitBranch,
    phase: 8,
    description:
      'Explore the chain from conversation evidence to requirements, artifacts, and tests.',
  },
  {
    path: '/feedback',
    label: 'Client Feedback',
    icon: MessagesSquare,
    phase: 9,
    description:
      'Client feedback will drive reviewed impact analysis and a versioned POC update.',
  },
  {
    path: '/value',
    label: 'Value Report',
    icon: ChartNoAxesCombined,
    phase: 10,
    description:
      'Illustrative engagement outcomes and Time-to-POC will complete the storyline.',
  },
] as const;
