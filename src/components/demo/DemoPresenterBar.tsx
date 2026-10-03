import { useState } from 'react';
import {
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ShieldCheck,
  List,
  Focus,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { demoStory, fullDemoDurationMs } from '@/demo/demoStory';
import {
  demoChapters,
  demoTargets,
  type DemoDirectorState,
} from '@/demo/demoTypes';
import {
  selectCurrentDemoChapter,
  selectCurrentDemoStep,
  selectDemoProgress,
} from '@/demo/demoSelectors';
import { governanceCountdownMs } from '@/demo/demoDirector';
export function DemoPresenterBar() {
  const s = useDemoStore(),
    d = s.director;
  const [chapters, setChapters] = useState(false),
    [expanded, setExpanded] = useState(false);
  if (d.mode !== 'autopilot') return null;
  const step = selectCurrentDemoStep(s),
    chapter = selectCurrentDemoChapter(s),
    progress = selectDemoProgress(s);
  const governance = step.governance && d.status !== 'completed';
  const seconds = Math.max(
    0,
    Math.ceil((governanceCountdownMs - d.stepElapsedMs) / 1000),
  );
  return (
    <aside className="demo-presenter" aria-label="Guided Demo presenter">
      {d.routeBlocked && (
        <div className="demo-route-prompt" role="status">
          <strong>Guided Demo is currently running.</strong>
          <span>Progression is frozen while you explore this route.</span>
          <button onClick={s.returnToDemo}>Return to Demo</button>
          <button onClick={s.exitFullDemo}>Exit Autopilot</button>
        </div>
      )}
      {d.error && <p role="alert">{d.error}</p>}
      {governance && !d.routeBlocked && (
        <div className="demo-governance" role="status">
          <ShieldCheck size={22} />
          <div>
            <strong>HUMAN GOVERNANCE GATE · {step.governance!.label}</strong>
            <p>
              {d.actionDone
                ? '✓ Consultant approval simulated for this guided demo'
                : 'Simulating consultant approval for this guided demo'}
            </p>
          </div>
          <b aria-hidden="true">{d.actionDone ? '✓' : seconds}</b>
        </div>
      )}
      <div className="demo-narration" aria-live="polite" aria-atomic="true">
        <span>CONVO2POC INSIGHT</span>
        <p>{step.narration}</p>
        {step.spotlight && (
          <small>
            <Focus size={12} /> Spotlight · {demoTargets[step.spotlight]}
          </small>
        )}
      </div>
      {d.prepared && (
        <small className="demo-preparation-note">
          Prerequisites replayed through valid transitions, with simulated
          consultant approvals where required.
        </small>
      )}
      <div className="demo-presenter-main">
        <div className="demo-position">
          <strong>CONVO2POC GUIDED DEMO</strong>
          <span>
            {chapter.title} · Step {d.stepIndex + 1} of {demoStory.length} ·{' '}
            {progress}%
          </span>
          <progress
            aria-label="Guided Demo progress"
            value={progress}
            max={100}
          />
        </div>
        <div className="demo-presenter-controls">
          <button
            disabled={d.status === 'completed'}
            onClick={d.status === 'paused' ? s.resumeFullDemo : s.pauseFullDemo}
          >
            {d.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}{' '}
            {d.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            disabled={d.stepIndex === demoStory.length - 1}
            onClick={s.nextDemoStep}
          >
            Next <ChevronRight size={15} />
          </button>
          <button
            className="demo-more"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            More
          </button>
          <div className={`demo-extra-controls ${expanded ? 'expanded' : ''}`}>
            <button disabled={!d.stepIndex} onClick={s.previousDemoStep}>
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              aria-expanded={chapters}
              onClick={() => setChapters(!chapters)}
            >
              <List size={15} /> Chapters
            </button>
            <label className="demo-speed">
              <span className="sr-only">Guided Demo speed</span>
              <select
                aria-label="Guided Demo speed"
                value={d.speed}
                onChange={(e) =>
                  s.setPresentationSpeed(
                    Number(e.target.value) as DemoDirectorState['speed'],
                  )
                }
              >
                {[0.75, 1, 1.5, 2].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
            </label>
            <button onClick={s.restartFullDemo}>
              <RotateCcw size={15} /> Restart Demo
            </button>
            <button onClick={() => s.setPresentationMode(!d.presentationMode)}>
              {d.presentationMode ? 'Show Navigation' : 'Hide Navigation'}
            </button>
          </div>
          {!d.routeBlocked && (
            <button onClick={s.exitFullDemo}>
              <X size={15} /> Exit Autopilot
            </button>
          )}
        </div>
      </div>
      {chapters && (
        <nav className="demo-chapters" aria-label="Demo chapters">
          {demoChapters.map((c) => {
            const index = demoStory.findIndex(
              (step) => step.chapterId === c.id,
            );
            return (
              <button
                key={c.id}
                aria-current={c.id === chapter.id ? 'step' : undefined}
                onClick={() => {
                  s.jumpToDemoChapter(c.id);
                  setChapters(false);
                }}
              >
                <span>
                  {index < d.stepIndex ? '✓' : c.id === chapter.id ? '●' : '○'}
                </span>
                <b>{c.title}</b>
                <small>{c.label}</small>
              </button>
            );
          })}
        </nav>
      )}
      <span className="sr-only">
        Illustrative presentation · default duration{' '}
        {Math.round(fullDemoDurationMs / 1000)} seconds · approvals are
        simulated consultant decisions.
      </span>
    </aside>
  );
}
