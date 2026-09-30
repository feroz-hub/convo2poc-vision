import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { storyboardFrames } from '@/data/overview';
import { requirements } from '@/data/requirements';
export function StoryboardStrip() {
  return (
    <section
      className="overview-section storyboard-section"
      aria-labelledby="story-title"
    >
      <div className="overview-section-heading">
        <div>
          <span className="section-kicker">
            ONE CONVERSATION. A CLEAR PATH.
          </span>
          <h2 id="story-title">See the idea unfold</h2>
        </div>
        <span className="section-aside">
          Illustrative scenario · not live playback
        </span>
      </div>
      <ol className="storyboard-grid">
        {storyboardFrames.map((frame, index) => (
          <StoryFrame key={frame.kind} frame={frame} index={index} />
        ))}
      </ol>
    </section>
  );
}

export function StoryFrame({
  frame,
  index,
}: {
  frame: (typeof storyboardFrames)[number];
  index: number;
}) {
  const { title, caption, icon: Icon, kind } = frame;
  const records = requirements
    .filter((item) => item.type === 'functional')
    .slice(0, 3);
  return (
    <li className="story-frame">
      <div className={`story-picture story-${kind}`} aria-hidden="true">
        <Icon size={30} />
        {kind === 'conversation' && (
          <div className="story-bubbles">
            <span />
            <span />
            <span />
          </div>
        )}
        {kind === 'requirements' && (
          <div className="story-records">
            {records.map(({ id }) => (
              <span key={id}>
                <Check size={12} />
                {id}
              </span>
            ))}
          </div>
        )}
        {kind === 'clarification' && (
          <div className="story-answer">
            <span>High priority?</span>
            <ArrowRight size={14} />
            <strong>P1</strong>
          </div>
        )}
        {kind === 'prototype' && (
          <div className="story-app">
            <div />
            <span />
            <span />
            <span />
            <LockKeyhole size={14} />
          </div>
        )}
      </div>
      <div className="story-frame-caption">
        <span>0{index + 1}</span>
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
      </div>
      {index < storyboardFrames.length - 1 && (
        <ArrowRight className="story-arrow" size={16} aria-hidden="true" />
      )}
    </li>
  );
}
