import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, MessageSquare, ScanText } from 'lucide-react';
import { transcript } from '@/data/transcript';
import { participants, liveInsights } from '@/data/liveSession';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/ui/button';
import type { TranscriptMessage as Message } from '@/types/domain';
export function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <span
      className={`voice-waveform ${active ? 'active' : ''}`}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} />
      ))}
    </span>
  );
}
function ParticipantStrip() {
  const active = useDemoStore((s) => s.activeSpeaker);
  const running = useDemoStore((s) => s.isRunning);
  return (
    <ul
      className="participant-strip"
      aria-label="Fictional meeting participants"
    >
      {participants.map((p) => (
        <li
          key={p.role}
          className={running && active === p.role ? 'speaking' : ''}
        >
          <span className={`participant-avatar ${p.role}`}>{p.initials}</span>
          <div>
            <strong>{p.name}</strong>
            <small>{p.title}</small>
          </div>
          <VoiceWaveform active={running && active === p.role} />
        </li>
      ))}
    </ul>
  );
}
function TranscriptMessage({
  message,
  active,
  badges,
  speaking,
}: {
  message: Message;
  active: boolean;
  speaking: boolean;
  badges: string[];
}) {
  const reduced = useReducedMotion();
  const participant = participants.find((p) => p.role === message.role)!;
  return (
    <motion.li
      layout={false}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      className={`transcript-message ${message.role} ${active ? 'current' : ''}`}
      id={`transcript-${message.id}`}
    >
      <span className={`participant-avatar ${message.role}`}>
        {participant.initials}
      </span>
      <div className="transcript-body">
        <header>
          <strong>{participant.name}</strong>
          <span>
            {message.role === 'system'
              ? 'Intelligence'
              : message.role === 'client'
                ? 'Client'
                : 'Consultant'}{' '}
            · <time>{message.timestamp}</time>
          </span>
          {speaking && <VoiceWaveform active />}
        </header>
        <p>{message.text}</p>
        {badges.length > 0 && (
          <div className="transcript-badges">
            {badges.map((id) => (
              <span key={id}>
                <ScanText size={12} aria-hidden="true" />
                {id} detected
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}
export function ConversationPanel() {
  const visible = useDemoStore((s) => s.visibleTranscriptMessageIds);
  const insights = useDemoStore((s) => s.visibleInsightEventIds);
  const running = useDemoStore((s) => s.isRunning);
  const elapsed = useDemoStore((s) => s.elapsedMs);
  const speakerUntil = useDemoStore((s) => s.speakerUntilMs);
  const position = useDemoStore((s) => s.currentTranscriptPosition);
  const [following, setFollowing] = useState(true);
  const feed = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const reduced = useReducedMotion();
  const scrollToLive = () => {
    if (feed.current)
      feed.current.scrollTo({
        top: feed.current.scrollHeight,
        behavior: reduced ? 'instant' : 'smooth',
      });
  };
  useEffect(() => {
    if (visible.length === 0) {
      follow.current = true;
    }
    if (follow.current && feed.current)
      feed.current.scrollTo({
        top: visible.length ? feed.current.scrollHeight : 0,
        behavior: 'instant',
      });
  }, [visible, insights]);
  useEffect(() => {
    const element = feed.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (follow.current)
        element.scrollTo({ top: element.scrollHeight, behavior: 'instant' });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="conversation-panel session-panel"
      aria-labelledby="conversation-title"
    >
      <div className="session-panel-title">
        <div>
          <MessageSquare size={18} aria-hidden="true" />
          <h2 id="conversation-title">Client conversation</h2>
        </div>
        <span>
          {visible.length} / {transcript.length} turns
        </span>
      </div>
      <ParticipantStrip />
      <div
        className="transcript-feed"
        ref={feed}
        tabIndex={0}
        role="region"
        aria-label="Client conversation transcript"
        onScroll={() => {
          const el = feed.current;
          if (!el) return;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 64;
          setFollowing(follow.current);
        }}
      >
        {!visible.length ? (
          <div className="session-empty">
            <MessageSquare size={32} aria-hidden="true" />
            <h3>The conversation starts here</h3>
            <p>
              Run the demo to hear the client’s story through a simulated
              transcript. Watch evidence become requirements alongside it.
            </p>
            <span>Client → Conversation → Intelligence</span>
          </div>
        ) : (
          <ol aria-label="Transcript messages">
            {transcript
              .filter((m) => visible.includes(m.id))
              .map((message) => {
                const detections = liveInsights.filter(
                  (i) =>
                    insights.includes(i.id) &&
                    i.sourceMessageId === message.id &&
                    i.requirementId &&
                    !['requirement-confirmed', 'clarification-needed'].includes(
                      i.kind,
                    ),
                );
                return (
                  <TranscriptMessage
                    key={message.id}
                    message={message}
                    active={
                      transcript[position]?.id === message.id &&
                      elapsed < speakerUntil
                    }
                    speaking={
                      running &&
                      transcript[position]?.id === message.id &&
                      elapsed < speakerUntil
                    }
                    badges={detections.map((i) => i.requirementId!)}
                  />
                );
              })}
          </ol>
        )}
      </div>
      <div className="conversation-footer">
        <span>Canonical transcript · timestamps reflect the workshop</span>
        {!following && visible.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              follow.current = true;
              setFollowing(true);
              scrollToLive();
            }}
          >
            <ArrowDown size={14} />
            Return to live
          </Button>
        )}
      </div>
    </section>
  );
}
