interface SetupScreenProps {
  restMins: number;
  timesUp: number;
  canSpeak: boolean;
  onCallNow: () => void;
  onRest: () => void;
}

export function SetupScreen({ restMins, timesUp, canSpeak, onCallNow, onRest }: SetupScreenProps) {
  return (
    <div className="ri-fade ri-center">
      <div className="ri-mark">
        <span className="ri-mark-sun" />
      </div>
      <h1 className="ri-title">Rise</h1>
      <p className="ri-sub">
        A gentle voice to get you up and moving. Set it down, lie back, and I&rsquo;ll call you up.
      </p>

      <div className="ri-choices">
        <button className="ri-choice ri-tap" type="button" onClick={onCallNow}>
          <span className="ri-choice-h">Call me now</span>
          <span className="ri-choice-s">Gentle calls start right away, until you&rsquo;re up.</span>
        </button>
        <button className="ri-choice ri-tap" type="button" onClick={onRest}>
          <span className="ri-choice-h">Rest, then call</span>
          <span className="ri-choice-s">
            Lie back for {restMins} min, then I&rsquo;ll wake you.
          </span>
        </button>
      </div>

      {timesUp > 0 && (
        <div className="ri-stat">
          You&rsquo;ve risen with me {timesUp} {timesUp === 1 ? 'time' : 'times'}.
        </div>
      )}
      {!canSpeak && (
        <div className="ri-note">
          Your browser can&rsquo;t speak, so I&rsquo;ll use gentle chimes instead.
        </div>
      )}
    </div>
  );
}
