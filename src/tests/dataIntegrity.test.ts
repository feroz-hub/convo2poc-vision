import { describe, expect, it } from 'vitest';
import { scenario } from '@/data/scenario';
import { transcript, feedbackTranscript } from '@/data/transcript';
import { requirements, clarifications } from '@/data/requirements';
import { scopeItems } from '@/data/scope';
import { artifacts, traceNodes, traceEdges } from '@/data/traceability';
import { changeRequests } from '@/data/feedback';
import { agents, buildChecks } from '@/data/agents';
import { catalogMetrics } from '@/data/metrics';

describe('canonical scenario integrity', () => {
  it('keeps unique IDs in every catalog', () => {
    for (const records of [
      requirements,
      clarifications,
      scopeItems,
      transcript,
      feedbackTranscript,
      artifacts,
      traceNodes,
      traceEdges,
      agents,
      buildChecks,
      changeRequests,
    ]) {
      expect(new Set(records.map((record) => record.id)).size).toBe(
        records.length,
      );
    }
  });
  it('retains all specified requirement records and derives actual counts', () => {
    expect(requirements.filter((r) => r.type === 'functional')).toHaveLength(8);
    expect(requirements.filter((r) => r.type === 'business-rule')).toHaveLength(
      4,
    );
    expect(
      requirements.filter((r) => r.type === 'non-functional'),
    ).toHaveLength(2);
    expect(requirements.filter((r) => r.type === 'assumption')).toHaveLength(3);
    expect(requirements.filter((r) => r.type === 'open-question')).toHaveLength(
      3,
    );
    expect(catalogMetrics).toMatchObject({
      requirements: 20,
      clarifications: 3,
      includedRequirements: 8,
      mockedDependencies: 2,
      excludedCapabilities: 5,
    });
  });
  it('matches source evidence, timestamps, actors, and confidence', () => {
    for (const requirement of requirements) {
      expect(requirement.confidence).toBeGreaterThanOrEqual(0);
      expect(requirement.confidence).toBeLessThanOrEqual(100);
      for (const actor of requirement.actors)
        expect(scenario.actors).toContain(actor);
      if (!requirement.sourceMessageId) {
        expect(requirement.tags).toContain('scenario brief');
        continue;
      }
      const source = transcript.find(
        (message) => message.id === requirement.sourceMessageId,
      );
      expect(source).toBeDefined();
      expect(requirement.sourceTimestamp).toBe(source?.timestamp);
      expect(requirement.speaker).toBe(source?.speaker);
    }
  });
  it('has monotonically increasing transcript timestamps', () => {
    const times = transcript.map((message) => {
      const [minutes, seconds] = message.timestamp.split(':').map(Number);
      return (minutes ?? 0) * 60 + (seconds ?? 0);
    });
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
  it('links scope, clarifications, artifacts, and feedback to real records', () => {
    const requirementIds = new Set(requirements.map((r) => r.id));
    const messageIds = new Set(transcript.map((m) => m.id));
    for (const item of [...scopeItems, ...artifacts, ...changeRequests])
      for (const id of item.requirementIds)
        expect(requirementIds.has(id)).toBe(true);
    for (const clarification of clarifications) {
      for (const id of [
        clarification.requirementId,
        ...clarification.affectedRequirementIds,
      ])
        expect(requirementIds.has(id)).toBe(true);
      expect(messageIds.has(clarification.sourceMessageId)).toBe(true);
      expect(messageIds.has(clarification.resolutionMessageId)).toBe(true);
    }
    for (const change of changeRequests) {
      expect(
        feedbackTranscript.some((m) => m.id === change.sourceMessageId),
      ).toBe(true);
      for (const id of change.impactedArtifacts)
        expect(artifacts.some((a) => a.id === id)).toBe(true);
    }
  });
  it('preserves a navigable conversation-to-test chain', () => {
    const nodeIds = new Set(traceNodes.map((node) => node.id));
    for (const edge of traceEdges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
    const reachable = new Set(['msg-004']);
    for (let i = 0; i < traceNodes.length; i++)
      for (const edge of traceEdges)
        if (reachable.has(edge.source)) reachable.add(edge.target);
    for (const id of [
      'FR-003',
      'US-004',
      'assignment-screen',
      'assignment-api',
      'TC-012',
      'TC-013',
      'TC-014',
    ])
      expect(reachable.has(id)).toBe(true);
  });
});

describe('approval-expansion feedback scenario', () => {
  it('keeps v1 P1-only and describes a genuine P2 expansion', () => {
    const change = changeRequests[0]!;
    expect(change.previousValue).toBe(
      'Only P1 requests require manager approval.',
    );
    expect(change.newValue).toBe(
      'Both P1 and P2 requests require manager approval.',
    );
    expect(feedbackTranscript[0]?.text).toBe(
      'The workflow looks good. We also want P2 requests to require manager approval.',
    );
    expect(change.requirementIds).toEqual(['FR-007', 'BR-003']);
    expect(requirements.find((r) => r.id === 'BR-003')?.description).toBe(
      'P1 requests require manager approval before work begins.',
    );
    const impact = artifacts.filter((a) =>
      change.impactedArtifacts.includes(a.id),
    );
    for (const kind of ['rule', 'document', 'screen', 'api', 'test'])
      expect(impact.some((a) => a.kind === kind)).toBe(true);
    expect(impact.every((a) => a.requirementIds.includes('BR-003'))).toBe(true);
  });
});
