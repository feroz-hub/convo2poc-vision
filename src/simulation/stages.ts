export const demoStages = [
  'conversation',
  'requirements',
  'clarification',
  'scope',
  'generation',
  'preview',
  'traceability',
  'feedback',
  'value',
] as const;
export type DemoStage = (typeof demoStages)[number];
