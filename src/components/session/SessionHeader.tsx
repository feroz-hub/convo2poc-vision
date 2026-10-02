import {
  Radio,
  Users,
  ArrowRight,
  MessageSquare,
  ScanText,
  ListChecks,
} from 'lucide-react';
import { scenario } from '@/data/scenario';
import { participants, sessionDurationMs } from '@/data/liveSession';
import { useDemoStore } from '@/store/demoStore';
import { selectPlaybackLabel } from '@/store/sessionSelectors';
import { DemoControls } from '@/components/shell/DemoControls';
function formatElapsed(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
export function ReadinessIndicator() {
  const readiness = useDemoStore((s) => s.liveReadiness);
  return (
    <div className="session-readiness">
      <div>
        <span>POC readiness</span>
        <strong>{readiness}%</strong>
      </div>
      <progress
        aria-label="Illustrative POC readiness"
        value={readiness}
        max={100}
      />
      <small>Illustrative readiness model · review still required</small>
    </div>
  );
}
export function SessionHeader() {
  const label = useDemoStore(selectPlaybackLabel);
  const elapsed = useDemoStore((s) => s.elapsedMs);
  const stage = useDemoStore((s) => s.currentStage);
  const running = useDemoStore((s) => s.isRunning);
  return (
    <>
      <header className="session-page-heading">
        <div>
          <p className="session-kicker">DISCOVERY WORKSPACE / PHASE 3</p>
          <h1>Live Session</h1>
          <p>
            Watch a client conversation become structured requirement
            intelligence.
          </p>
        </div>
        <span className="session-synthetic">Synthetic client workshop</span>
      </header>
      <section className="session-header" aria-label="Live client session">
        <div>
          <p className="session-kicker">{scenario.client}</p>
          <h2>Service Request Discovery Workshop</h2>
          <p className="session-engagement">{scenario.engagement}</p>
          <div className="session-metadata">
            <span className={running ? 'session-live running' : 'session-live'}>
              <Radio size={14} aria-hidden="true" />
              {label}
            </span>
            <span className="session-clock">
              {formatElapsed(elapsed)}{' '}
              <small>/ {formatElapsed(sessionDurationMs)} demo</small>
            </span>
            <span>
              <Users size={14} aria-hidden="true" />
              {participants.length} participants
            </span>
            <span>
              Stage:{' '}
              {stage === 'clarification'
                ? 'Ambiguity detection'
                : stage === 'requirements'
                  ? 'Requirement detection'
                  : 'Client conversation'}
            </span>
          </div>
        </div>
        <ReadinessIndicator />
      </section>
      <div className="session-playback">
        <DemoControls enabled />
        <span>80-second simulation · no audio or microphone</span>
      </div>
      <div
        className="session-flow"
        aria-label="Conversation to requirement intelligence"
      >
        <span>
          <MessageSquare size={16} aria-hidden="true" />
          Client speaks
        </span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>
          <ScanText size={16} aria-hidden="true" />
          Evidence detected
        </span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>
          <ListChecks size={16} aria-hidden="true" />
          Structured intelligence
        </span>
      </div>
    </>
  );
}
