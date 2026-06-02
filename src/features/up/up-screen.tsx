interface UpScreenProps {
  onDone: () => void;
}

export function UpScreen({ onDone }: UpScreenProps) {
  return (
    <div className="ri-fade ri-center">
      <h1 className="ri-title">You&rsquo;re up.</h1>
      <p className="ri-sub">
        That was the hardest part. Go do the first small thing while the momentum&rsquo;s with you.
      </p>
      <button className="ri-cta ri-tap" type="button" onClick={onDone}>
        Done
      </button>
    </div>
  );
}
