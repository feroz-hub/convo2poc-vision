import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { heroStory } from '@/data/overview';
export function SignalPath() {
  const marker = useId();
  const reduced = useReducedMotion();
  return (
    <svg
      className="concept-connections"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker
          id={marker}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10Z" fill="var(--diagram-connector)" />
        </marker>
      </defs>
      {[
        'M26 16H40',
        'M62 16H76',
        'M86 33V40',
        'M74 52H60',
        'M38 52H24',
        'M14 65V72',
        'M26 84H40',
        'M62 84H76',
      ].map((d) => (
        <path
          key={d}
          d={d}
          className="concept-direction"
          markerEnd={`url(#${marker})`}
        />
      ))}
      <path className="concept-track" d="M14 16 H50 H86 V52 H50 H14 V84 H50" />
      <motion.path
        className="story-signal"
        d="M14 16 H50 H86 V52 H50 H14 V84 H50"
        initial={false}
        animate={
          reduced
            ? { pathLength: 1 }
            : {
                pathLength: [
                  0, 0, 0.15, 0.3, 0.43, 0.43, 0.58, 0.74, 0.88, 1, 1, 0,
                ],
              }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                duration: heroStory.duration,
                repeat: Infinity,
                ease: 'linear',
                times: [
                  0,
                  2 / 30,
                  4 / 30,
                  6 / 30,
                  9 / 30,
                  12 / 30,
                  15 / 30,
                  18 / 30,
                  21 / 30,
                  24 / 30,
                  0.98,
                  1,
                ],
              }
        }
      />
    </svg>
  );
}
