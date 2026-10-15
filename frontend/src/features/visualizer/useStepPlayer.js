import { useCallback, useEffect, useState } from 'react';

// Plays through a precomputed list of steps. Pause, step forward/back and reset
// all just move the index, so the animation is always in sync with the real run.
export function useStepPlayer(steps, delay) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = steps.length - 1;

  useEffect(() => { setIndex(0); setPlaying(false); }, [steps]);

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= last) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), delay);
    return () => clearTimeout(t);
  }, [playing, index, last, delay]);

  const play = useCallback(() => { if (index >= last) setIndex(0); setPlaying(true); }, [index, last]);
  return {
    index: Math.min(index, last),
    step: steps[Math.min(index, last)],
    total: steps.length,
    playing,
    atEnd: index >= last,
    play,
    pause: () => setPlaying(false),
    next: () => { setPlaying(false); setIndex((i) => Math.min(i + 1, last)); },
    prev: () => { setPlaying(false); setIndex((i) => Math.max(i - 1, 0)); },
    reset: () => { setPlaying(false); setIndex(0); },
    seek: (i) => { setPlaying(false); setIndex(Math.max(0, Math.min(i, last))); },
  };
}
