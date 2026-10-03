import { demoStory } from './demoStory';
import { createDirectorState, type DemoSimulation } from './demoTypes';
import {
  dispatchDirector,
  executeDemoAction,
  updateDirector,
  type DirectorHost,
} from './demoActions';
import { demoConditionMet } from './demoConditions';
import {
  generationEvents,
  generationDurationMs,
} from '@/simulation/generationEvents';
import { liveInsights, sessionDurationMs } from '@/data/liveSession';
import { feedbackMilestones, deltaMilestones } from '@/data/feedbackEvolution';
export const governanceCountdownMs = 3000;
export function simulationTarget(sim: DemoSimulation): number {
  if (sim.lane === 'session') {
    if (sim.until === 'complete') return sessionDurationMs;
    const id =
      sim.until === 'requirements'
        ? 'insight-FR-002'
        : sim.until === 'ambiguity'
          ? 'insight-clarify-OQ-001'
          : 'insight-confirm-FR-007';
    return liveInsights.find((i) => i.id === id)!.at;
  }
  if (sim.lane === 'generation') {
    if (sim.until === 'complete') return generationDurationMs;
    if (sim.until === 'tests')
      return generationEvents.find((e) => e.type === 'TEST_PASSED')!.at;
    return generationEvents.find(
      (e) =>
        e.type === 'AGENT_UPDATED' &&
        e.agentId === (sim.until === 'parallel' ? 'data' : 'architecture') &&
        e.status === 'running',
    )!.at;
  }
  const events = sim.lane === 'feedback' ? feedbackMilestones : deltaMilestones;
  return sim.until === 'cr001'
    ? feedbackMilestones.find((e) => e.at === 8000)!.at
    : events.at(-1)!.at;
}
function laneTime(host: DirectorHost, sim: DemoSimulation) {
  const s = host.get();
  return sim.lane === 'session'
    ? s.elapsedMs
    : sim.lane === 'generation'
      ? s.generation.elapsedMs
      : sim.lane === 'feedback'
        ? s.feedback.capture.elapsedMs
        : s.feedback.delta.elapsedMs;
}
export function pauseControlledSimulation(host: DirectorHost) {
  dispatchDirector(() => {
    const a = host.get();
    if (a.isRunning) a.pause();
    if (a.generation.status === 'running') a.pauseGeneration();
    if (a.feedback.capture.status === 'running') a.feedbackPlayback('pause');
    if (a.feedback.delta.status === 'running') a.deltaPlayback('pause');
  });
}
function startLane(host: DirectorHost, sim: DemoSimulation) {
  dispatchDirector(() => {
    const a = host.get();
    if (laneTime(host, sim) >= simulationTarget(sim)) return;
    if (sim.lane === 'session') {
      if (a.isPaused) a.resume();
      else a.start();
    }
    if (sim.lane === 'generation') {
      if (a.generation.status === 'paused') a.resumeGeneration();
      else a.startGeneration();
    }
    if (sim.lane === 'feedback') {
      if (a.feedback.capture.status === 'paused') a.feedbackPlayback('resume');
      else a.startFeedback();
    }
    if (sim.lane === 'delta') {
      if (a.feedback.delta.status === 'paused') a.deltaPlayback('resume');
      else a.startDelta();
    }
  });
}
function finishSimulation(
  host: DirectorHost,
  sim: DemoSimulation,
  target: number,
) {
  startLane(host, sim);
  const delta = Math.max(0, target - laneTime(host, sim));
  if (delta)
    dispatchDirector(() => host.get().tick(delta / host.get().demoSpeed));
  // The director holds canonical time at the milestone while the viewer reads.
  // Keep active-agent visuals running until an actual pause or step transition.
}
export function enterDirectorStep(host: DirectorHost) {
  const d = host.get().director,
    step = demoStory[d.stepIndex]!;
  if (d.entered) return;
  updateDirector(host, {
    entered: true,
    simulationStartMs: step.simulation ? laneTime(host, step.simulation) : 0,
  });
  if (step.action && !step.governance) {
    executeDemoAction(host, step.action);
    updateDirector(host, { actionDone: true });
  }
  if (step.simulation) startLane(host, step.simulation);
  if (step.completion && demoConditionMet(host.get(), step.condition)) {
    pauseControlledSimulation(host);
    updateDirector(host, { status: 'completed' });
  }
}
export function tickDirector(host: DirectorHost, deltaMs: number) {
  let d = host.get().director;
  if (d.status !== 'running' || !d.routeReady || d.routeBlocked || d.error)
    return;
  enterDirectorStep(host);
  d = host.get().director;
  if (d.status === 'completed') return;
  const step = demoStory[d.stepIndex]!,
    elapsed = d.stepElapsedMs + deltaMs * d.speed;
  updateDirector(host, {
    stepElapsedMs: elapsed,
    elapsedMs: d.elapsedMs + deltaMs * d.speed,
  });
  if (step.simulation) {
    const target = simulationTarget(step.simulation);
    const at = Math.min(
      target,
      d.simulationStartMs +
        (target - d.simulationStartMs) *
          Math.min(1, elapsed / step.simulation.presentationMs),
    );
    finishSimulation(host, step.simulation, at);
  }
  if (
    step.governance &&
    step.action &&
    !d.actionDone &&
    elapsed >= governanceCountdownMs
  ) {
    executeDemoAction(host, step.action);
    updateDirector(host, { actionDone: true });
  }
  if (
    elapsed >= step.durationMs &&
    demoConditionMet(host.get(), step.condition)
  ) {
    pauseControlledSimulation(host);
    updateDirector(host, {
      stepIndex: d.stepIndex + 1,
      stepElapsedMs: 0,
      entered: false,
      actionDone: false,
      routeReady: false,
      navigationRevision: d.navigationRevision + 1,
    });
  } else if (elapsed > step.durationMs + 15000) {
    pauseControlledSimulation(host);
    updateDirector(host, {
      status: 'paused',
      error: `Waiting for ${step.condition}. Restart or select a chapter to prepare the canonical prerequisites.`,
    });
  }
}
// Next, Previous and chapter jumps replay valid transitions instead of reversing frozen baselines.
export function prepareDemoThrough(
  host: DirectorHost,
  index: number,
  status: 'running' | 'paused' = 'running',
) {
  const previous = host.get().director;
  dispatchDirector(() => host.get().reset());
  updateDirector(host, {
    ...createDirectorState(),
    mode: 'autopilot',
    status,
    speed: previous.mode === 'autopilot' ? previous.speed : 1,
    presentationMode:
      previous.mode === 'autopilot' ? previous.presentationMode : true,
    navigationRevision: previous.navigationRevision + 1,
    prepared: index > 0,
  });
  for (let i = 0; i < index; i++) {
    const step = demoStory[i]!;
    updateDirector(host, { stepIndex: i });
    if (step.action) executeDemoAction(host, step.action);
    if (step.simulation)
      finishSimulation(
        host,
        step.simulation,
        simulationTarget(step.simulation),
      );
    if (!demoConditionMet(host.get(), step.condition)) {
      updateDirector(host, {
        status: 'paused',
        error: `Prerequisite replay stopped at ${step.title}.`,
      });
      return;
    }
  }
  pauseControlledSimulation(host);
  updateDirector(host, {
    stepIndex: index,
    stepElapsedMs: 0,
    elapsedMs: demoStory.slice(0, index).reduce((n, s) => n + s.durationMs, 0),
    entered: false,
    actionDone: false,
    routeReady: false,
    routeBlocked: false,
  });
}
