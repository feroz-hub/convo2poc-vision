import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '@/store/demoStore';
import { OverviewHero } from '@/components/overview/OverviewHero';
import { WorkflowRibbon } from '@/components/overview/WorkflowRibbon';
import { DemoMetrics } from '@/components/overview/DemoMetrics';
import { Differentiation } from '@/components/overview/Differentiation';
import { BusinessValue } from '@/components/overview/BusinessValue';
export function OverviewPage() {
  const navigate = useNavigate();
  const reset = useDemoStore((state) => state.reset);
  const start = () => {
    reset();
    navigate('/session');
  };
  return (
    <div className="overview-page">
      <OverviewHero onStart={start} />
      <WorkflowRibbon />
      <DemoMetrics />
      <Differentiation />
      <BusinessValue />
    </div>
  );
}
