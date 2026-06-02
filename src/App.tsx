import { useCallback, useEffect, useState } from 'react';
import { SettingsOverlay } from '@/components/settings-overlay';
import { useApplyAccent } from '@/hooks/use-apply-accent';
import { useCaller } from '@/hooks/use-caller';
import { useInterval } from '@/hooks/use-interval';
import { useWakeLock } from '@/hooks/use-wake-lock';
import { SetupScreen } from '@/features/setup/setup-screen';
import { RestingScreen } from '@/features/resting/resting-screen';
import { CallingScreen } from '@/features/calling/calling-screen';
import { UpScreen } from '@/features/up/up-screen';
import { useRiseStore } from '@/store/rise-store';
import type { CallInfo, Phase } from '@/types/domain';

const CAN_SPEAK = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function App() {
  useApplyAccent();
  const settings = useRiseStore((state) => state.settings);
  const stats = useRiseStore((state) => state.stats);
  const recordRise = useRiseStore((state) => state.recordRise);

  const [phase, setPhase] = useState<Phase>('setup');
  const [restLeft, setRestLeft] = useState(settings.restMins * 60);
  const [intensity, setIntensity] = useState(0);
  const [callText, setCallText] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onCall = useCallback((info: CallInfo) => {
    setCallText(info.text);
    setIntensity((x) => Math.min(1, x + 0.14));
  }, []);
  const caller = useCaller(settings.chime, settings.voice, onCall);

  useWakeLock(phase === 'resting' || phase === 'calling');

  const beginCalling = useCallback(() => {
    setIntensity(0.12);
    setCallText('');
    setPhase('calling');
    // The unlock() happened on the tap that led here; start the voice shortly after.
    setTimeout(() => caller.current.start(), 200);
  }, [caller]);

  const callNow = useCallback(() => {
    caller.current.unlock();
    beginCalling();
  }, [caller, beginCalling]);

  const startRest = useCallback(() => {
    caller.current.unlock();
    setRestLeft(settings.restMins * 60);
    setPhase('resting');
  }, [caller, settings.restMins]);

  const cancel = useCallback(() => {
    caller.current.stop();
    setIntensity(0);
    setPhase('setup');
  }, [caller]);

  const rise = useCallback(() => {
    caller.current.stop();
    setPhase('up');
    recordRise(Date.now());
  }, [caller, recordRise]);

  const done = useCallback(() => {
    setIntensity(0);
    setPhase('setup');
  }, []);

  // Resting countdown: the updater stays pure (just decrement) so it accumulates
  // correctly even when many ticks fire at once; the transition to calling runs
  // in an effect off the committed value.
  useInterval(() => setRestLeft((s) => Math.max(0, s - 1)), phase === 'resting' ? 1000 : null);
  useEffect(() => {
    if (phase === 'resting' && restLeft <= 0) {
      beginCalling();
    }
  }, [phase, restLeft, beginCalling]);

  // Sunrise slowly drifts warmer while calling, on top of the per-call bumps.
  useInterval(() => setIntensity((x) => Math.min(1, x + 0.012)), phase === 'calling' ? 1000 : null);

  const showSky = phase === 'calling' || phase === 'up';
  const isUp = phase === 'up';
  const sunIntensity = isUp ? 1 : intensity;
  const skyStyle = showSky
    ? {
        background: `linear-gradient(180deg,
          color-mix(in oklab, var(--dawn-top) ${intensity * 100}%, var(--night-top)) 0%,
          color-mix(in oklab, var(--dawn-mid) ${intensity * 100}%, var(--night-mid)) 45%,
          color-mix(in oklab, var(--dawn-bot) ${intensity * 100}%, var(--night-bot)) 100%)`,
      }
    : undefined;

  return (
    <div className="ri-app" data-phase={phase} style={skyStyle}>
      {showSky && (
        <div className="ri-sky" aria-hidden="true">
          <div
            className="ri-sun"
            style={{
              transform: `translateY(${(1 - sunIntensity) * 220}px)`,
              opacity: 0.5 + 0.5 * sunIntensity,
            }}
          />
          <div className="ri-glow" style={{ opacity: sunIntensity * 0.9 }} />
        </div>
      )}

      {phase === 'setup' && (
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="ri-btn ri-btn-quiet ri-tap"
          style={{
            position: 'fixed',
            top: 16,
            insetInlineEnd: 16,
            zIndex: 10,
            fontSize: 18,
            padding: '8px 12px',
          }}
        >
          ⚙
        </button>
      )}

      <main className="ri-stage">
        {phase === 'setup' && (
          <SetupScreen
            restMins={settings.restMins}
            timesUp={stats.timesUp}
            canSpeak={CAN_SPEAK}
            onCallNow={callNow}
            onRest={startRest}
          />
        )}
        {phase === 'resting' && (
          <RestingScreen restLeft={restLeft} onCallNow={beginCalling} onCancel={cancel} />
        )}
        {phase === 'calling' && (
          <CallingScreen
            callText={callText}
            holdToRise={settings.holdToRise}
            onRise={rise}
            onCancel={cancel}
          />
        )}
        {phase === 'up' && <UpScreen onDone={done} />}
      </main>

      {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
