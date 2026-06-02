import { useRef, useState } from 'react';

const HOLD_MS = 1300;

interface RiseButtonProps {
  holdToRise: boolean;
  onRise: () => void;
}

/**
 * Confirm getting up. In hold mode you must hold ~1.3s (so it can't be
 * dismissed half-asleep); in tap mode a single press fires immediately. The fill
 * grows with the hold so the progress is visible, and the label reflects state.
 */
export function RiseButton({ holdToRise, onRise }: RiseButtonProps) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);

  function begin(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!holdToRise) {
      onRise();
      return;
    }
    startedAt.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - startedAt.current) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        onRise();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function end() {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setProgress(0);
  }

  const label = holdToRise ? (progress > 0.05 ? 'keep holding…' : 'Hold to get up') : "I'm up";

  return (
    <button
      className="ri-rise ri-tap"
      type="button"
      aria-label={holdToRise ? 'Hold to get up' : "I'm up"}
      onMouseDown={begin}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={begin}
      onTouchEnd={end}
    >
      <span
        className="ri-rise-fill"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <span className="ri-rise-label">{label}</span>
    </button>
  );
}
