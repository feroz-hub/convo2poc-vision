import { Clock3 } from 'lucide-react';
import { transcript } from '@/data/transcript';
import { liveInsights } from '@/data/liveSession';
import { useDemoStore } from '@/store/demoStore';
export function SessionTimeline() {
  const ids = useDemoStore((s) => s.visibleInsightEventIds);
  const visible = transcript.filter((message) =>
    liveInsights.some(
      (i) => i.sourceMessageId === message.id && ids.includes(i.id),
    ),
  );
  return (
    <details className="session-timeline">
      <summary>
        <Clock3 size={16} aria-hidden="true" />
        Session intelligence timeline{' '}
        <span>{visible.length} evidence moments</span>
      </summary>
      <ol>
        {visible.length ? (
          visible.map((message) => (
            <li key={message.id}>
              <time>{message.timestamp}</time>
              <span>
                {liveInsights
                  .filter(
                    (i) =>
                      i.sourceMessageId === message.id &&
                      ids.includes(i.id) &&
                      ![
                        'requirement-confirmed',
                        'clarification-needed',
                        'actor-detected',
                      ].includes(i.kind),
                  )
                  .map((i) => i.requirementId ?? 'Business problem')
                  .join(' · ')}
              </span>
            </li>
          ))
        ) : (
          <li>Evidence moments appear during playback.</li>
        )}
      </ol>
    </details>
  );
}
