import { useEffect } from 'react';

/*
 * Keeps the screen awake during resting/calling via the Screen Wake Lock API,
 * so the sunrise and voice are not cut short by the screen sleeping. Feature-
 * detected and fully guarded — a no-op where unsupported, and it re-acquires
 * the lock when the page becomes visible again.
 */
interface WakeLockSentinelLike {
  release: () => Promise<void>;
}
interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
    if (!active || !wakeLock) {
      return;
    }
    let sentinel: WakeLockSentinelLike | null = null;
    let released = false;

    const request = async () => {
      try {
        sentinel = await wakeLock.request('screen');
      } catch {
        // Denied or unsupported; the app still works.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) {
        void request();
      }
    };

    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
