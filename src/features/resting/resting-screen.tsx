import { formatClock } from '@/lib/format';

interface RestingScreenProps {
  restLeft: number;
  onCallNow: () => void;
  onCancel: () => void;
}

export function RestingScreen({ restLeft, onCallNow, onCancel }: RestingScreenProps) {
  return (
    <div className="ri-fade ri-center">
      <div className="ri-moon" aria-hidden="true">
        ☾
      </div>
      <p className="ri-rest-label">Resting. I&rsquo;ll gently call you in</p>
      <div className="ri-rest-time" aria-live="off">
        {formatClock(restLeft)}
      </div>
      <div className="ri-row">
        <button className="ri-btn ri-tap" type="button" onClick={onCallNow}>
          Call me now
        </button>
        <button className="ri-btn ri-btn-quiet ri-tap" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
