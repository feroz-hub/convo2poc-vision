import { motion, useReducedMotion } from 'framer-motion';
import { heroStory } from '@/data/overview';
export function SignalPath() {
  const reduced = useReducedMotion();
  return (
    <svg
      className="concept-connections"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path className="concept-track" d="M14 20 H50 H86 V52 H50 H14 V84 H50" />
      <motion.path
        className="story-signal"
        d="M14 20 H50 H86 V52 H50 H14 V84 H50"
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
