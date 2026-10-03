import { GuidedControls } from '@/components/demo/GuidedControls';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoStore } from '@/store/demoStore';
export function DemoControls({
  presentation = false,
  onStart,
  enabled = false,
}: {
  presentation?: boolean;
  onStart?: () => void;
  enabled?: boolean;
}) {
  const reset = useDemoStore((state) => state.reset);
  const start = useDemoStore((state) => state.start);
  const pause = useDemoStore((state) => state.pause);
  const resume = useDemoStore((state) => state.resume);
  const restart = useDemoStore((state) => state.restart);
  const nextEvent = useDemoStore((state) => state.nextEvent);
  const running = useDemoStore((state) => state.isRunning);
  const paused = useDemoStore((state) => state.isPaused);
  const complete = useDemoStore((state) => state.sessionComplete);
  return (
    <GuidedControls>
      <div className="demo-controls" aria-label="Demo controls">
        <Button
          size="sm"
          disabled={!presentation && (!enabled || running || paused)}
          onClick={presentation ? onStart : start}
        >
          <Play size={14} />
          Run Demo
        </Button>
        {!presentation && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={!enabled || (!running && !paused)}
              onClick={paused ? resume : pause}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
              {enabled ? (paused ? 'Resume' : 'Pause') : 'Pause / Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!enabled || complete}
              onClick={nextEvent}
            >
              <SkipForward size={14} />
              {enabled ? 'Next event' : 'Next stage'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!enabled}
              onClick={restart}
            >
              <RotateCcw size={14} />
              Restart
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={14} />
          Reset scenario
        </Button>
      </div>
    </GuidedControls>
  );
}
