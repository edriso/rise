import { RiseButton } from './rise-button';

interface CallingScreenProps {
  /** The current spoken phrase, always shown on screen (captions, never audio-only). */
  callText: string;
  holdToRise: boolean;
  onRise: () => void;
  onCancel: () => void;
}

export function CallingScreen({ callText, holdToRise, onRise, onCancel }: CallingScreenProps) {
  return (
    <div className="ri-center ri-calling">
      <div className="ri-call-bubble" key={callText} role="status" aria-live="polite">
        {callText || "Let's get you up."}
      </div>
      <RiseButton holdToRise={holdToRise} onRise={onRise} />
      <button className="ri-link ri-tap" type="button" onClick={onCancel}>
        not yet, give me a moment
      </button>
    </div>
  );
}
