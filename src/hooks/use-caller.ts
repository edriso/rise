import { useEffect, useRef } from 'react';
import { Caller } from '@/lib/caller';
import type { CallInfo } from '@/types/domain';

/*
 * A thin React wrapper around the Caller: builds one instance, keeps its options
 * live, re-picks the voice when the device's voice list loads (`voiceschanged`),
 * and forwards each call to the latest `onCall`. Returns the caller so screens
 * can `start()` / `stop()` / `unlock()` it.
 */
export function useCaller(
  sound: boolean,
  voice: boolean,
  onCall: (info: CallInfo) => void,
): React.RefObject<Caller> {
  const ref = useRef<Caller | null>(null);
  if (ref.current === null) {
    ref.current = new Caller({ sound, voice });
  }
  const caller = ref.current;

  const onCallRef = useRef(onCall);
  onCallRef.current = onCall;

  useEffect(() => {
    caller.onCall = (info) => onCallRef.current(info);
    if (!('speechSynthesis' in window)) {
      return () => caller.stop();
    }
    const handler = () => caller.resetVoice();
    // Prime the (async) voice list and re-pick when it changes.
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      caller.stop();
    };
  }, [caller]);

  useEffect(() => {
    caller.setOptions({ sound, voice });
  }, [caller, sound, voice]);

  return ref as React.RefObject<Caller>;
}
