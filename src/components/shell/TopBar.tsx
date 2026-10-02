import { useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, LockKeyhole, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { scenario } from '@/data/scenario';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/button';
import { DemoControls } from './DemoControls';
import { StatusBadge } from '@/components/common/StatusBadge';
export function TopBar({
  onOpen,
  navigationOpen,
}: {
  onOpen: () => void;
  navigationOpen: boolean;
}) {
  const path = useLocation().pathname;
  const overview = path === '/';
  const session = path === '/session';
  const clarifications = path === '/clarifications';
  const scope = path === '/scope';
  const requirements = path === '/requirements';
  const running = useDemoStore((state) => state.isRunning);
  const paused = useDemoStore((state) => state.isPaused);
  const complete = useDemoStore((state) => state.sessionComplete);
  const navigate = useNavigate();
  const reset = useDemoStore((state) => state.reset);
  const start = () => {
    reset();
    navigate('/session');
  };
  const version = useDemoStore((state) => state.currentPocVersion);
  const { theme, toggleTheme } = useTheme();
  return (
    <header
      className={`topbar ${overview ? 'topbar-overview' : session || clarifications || scope || requirements ? 'topbar-session' : ''}`}
    >
      <div className="brand-row">
        <span className="hcl-brand-area" aria-label="HCLTech brand area">
          HCLTech
        </span>
        <strong className="header-product">Convo2POC</strong>
        <span className="internal-badge">Internal Concept Prototype</span>
        <Button
          variant="ghost"
          size="sm"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
        <span className="header-context">
          Internal exploration · Not an approved production product
        </span>
      </div>
      <div className="engagement-row">
        <Button
          variant="ghost"
          size="icon"
          className="open-nav"
          onClick={onOpen}
          aria-label="Open navigation"
          aria-expanded={navigationOpen}
          aria-controls="app-navigation"
        >
          <PanelLeft size={20} />
        </Button>
        <div className="engagement-name">
          <strong>{scenario.engagement}</strong>
          <span>{scenario.client}</span>
        </div>
        <div className="session-meta">
          <StatusBadge>POC {version}</StatusBadge>
          <span className="session-status">
            {session
              ? running
                ? '● Simulated session live'
                : paused
                  ? 'Ⅱ Session paused'
                  : complete
                    ? '✓ Session captured'
                    : '○ Ready to run'
              : '○ Demo session idle'}
          </span>
          <LockKeyhole size={15} aria-label="Sandbox environment" />
        </div>
        {overview && <DemoControls presentation onStart={start} />}
      </div>
      {!overview && !session && !clarifications && !scope && !requirements && (
        <div className="controls-row">
          <span className="playback-note">Playback available in Phase 3</span>
          <DemoControls />
        </div>
      )}
    </header>
  );
}
