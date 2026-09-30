import { NavLink } from 'react-router-dom';
import { Boxes, Settings, PanelLeftClose } from 'lucide-react';
import { routes } from '@/app/routes';
import { scenario } from '@/data/scenario';
import { Button } from '@/components/ui/button';
export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <button
        aria-label="Close navigation overlay"
        className={`sidebar-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        id="app-navigation"
        className={`sidebar ${open ? 'open' : ''}`}
        aria-label="Application sidebar"
      >
        <div className="brand">
          <span className="brand-mark">
            <Boxes size={22} />
          </span>
          <div>
            Convo<span>2</span>POC<small>VISION WORKSPACE</small>
          </div>
          <Button
            className="close-nav"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <PanelLeftClose size={20} />
          </Button>
        </div>
        <div className="nav-label">ENGAGEMENT WORKSPACE</div>
        <nav aria-label="Main navigation">
          {routes.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-label">DEMO SCENARIO</div>
          <div className="scenario-mini">
            {scenario.name}
            <span>Synthetic client engagement</span>
          </div>
          <Button variant="ghost" disabled className="settings">
            <Settings size={17} />
            Settings · planned
          </Button>
          <div className="prototype-label">
            <span />
            Vision Prototype
          </div>
        </div>
      </aside>
    </>
  );
}
