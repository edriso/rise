import type { ReactNode } from 'react';
import { Overlay } from '@/components/overlay';
import { useRiseStore } from '@/store/rise-store';
import { ACCENTS } from '@/types/domain';

/** Settings: voice, chime, hold-to-confirm, rest length, and the sun accent. */
export function SettingsOverlay({ onClose }: { onClose: () => void }) {
  const settings = useRiseStore((state) => state.settings);
  const setVoice = useRiseStore((state) => state.setVoice);
  const setChime = useRiseStore((state) => state.setChime);
  const setHoldToRise = useRiseStore((state) => state.setHoldToRise);
  const setRestMins = useRiseStore((state) => state.setRestMins);
  const setAccent = useRiseStore((state) => state.setAccent);

  return (
    <Overlay ariaLabel="Settings" onClose={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#1d1a3a',
          border: '1px solid var(--line)',
          borderRadius: 20,
          padding: '24px 24px 26px',
          color: 'var(--ink)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 19 }}>
            Settings
          </span>
          <button
            onClick={onClose}
            className="ri-btn ri-btn-quiet ri-tap"
            type="button"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <Field label="Calling">
          <Toggle
            on={settings.voice}
            label="Speak to me"
            onChange={() => setVoice(!settings.voice)}
          />
          <Toggle on={settings.chime} label="Chime" onChange={() => setChime(!settings.chime)} />
          <Toggle
            on={settings.holdToRise}
            label="Hold to confirm I'm up"
            onChange={() => setHoldToRise(!settings.holdToRise)}
          />
        </Field>

        <Field label={`Rest before calling · ${settings.restMins} min`}>
          <input
            type="range"
            min={5}
            max={45}
            step={5}
            value={settings.restMins}
            onChange={(event) => setRestMins(Number(event.target.value))}
            aria-label="Rest before calling"
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </Field>

        <Field label="Sun">
          <div role="group" aria-label="Sun colour" style={{ display: 'flex', gap: 12 }}>
            {ACCENTS.map((color) => {
              const selected = settings.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-pressed={selected}
                  aria-label={color}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: color,
                    border: `2px solid ${selected ? 'var(--ink)' : 'transparent'}`,
                    boxShadow: '0 0 0 1px var(--line)',
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>
    </Overlay>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: 'var(--ui)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--faint)',
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--ink)',
        fontFamily: 'var(--ui)',
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          flexShrink: 0,
          background: on ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
          border: '1px solid var(--line)',
          position: 'relative',
          transition: 'background .25s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            insetInlineStart: on ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: on ? '#2a1c10' : 'var(--faint)',
            transition: 'inset-inline-start .25s ease',
          }}
        />
      </span>
    </button>
  );
}
