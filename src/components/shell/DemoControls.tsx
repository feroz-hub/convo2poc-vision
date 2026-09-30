import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoStore } from '@/store/demoStore';
export function DemoControls() {
  const reset = useDemoStore((state) => state.reset);
  return (
    <div className="demo-controls" aria-label="Demo controls">
      <Button size="sm" disabled>
        <Play size={14} />
        Run Demo
      </Button>
      <Button variant="outline" size="sm" disabled>
        <Pause size={14} />
        Pause / Resume
      </Button>
      <Button variant="outline" size="sm" disabled>
        <SkipForward size={14} />
        Next stage
      </Button>
      <Button variant="ghost" size="sm" disabled>
        <RotateCcw size={14} />
        Restart
      </Button>
      <Button variant="ghost" size="sm" onClick={reset}>
        <RotateCcw size={14} />
        Reset scenario
      </Button>
    </div>
  );
}
