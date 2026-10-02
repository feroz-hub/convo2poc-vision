import '@/styles/session.css';
import { SessionHeader } from '@/components/session/SessionHeader';
import { ConversationPanel } from '@/components/session/ConversationPanel';
import {
  InsightSignalAnimation,
  LiveIntelligencePanel,
} from '@/components/session/LiveIntelligencePanel';
import { SessionTimeline } from '@/components/session/SessionTimeline';
export function LiveSessionPage() {
  return (
    <div className="page-content session-page">
      <SessionHeader />
      <div className="session-workspace">
        <InsightSignalAnimation />
        <ConversationPanel />
        <LiveIntelligencePanel />
      </div>
      <SessionTimeline />
    </div>
  );
}
