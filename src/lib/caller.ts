import type { CallerOptions, CallInfo } from '@/types/domain';
import { phraseFor } from './phrases';
import { chimeVolume, levelForCycle, nextIntervalMs, speechVolume } from './scheduler';
import { pickBestVoice } from './voice-scoring';

/*
 * The Caller: a gentle, escalating "get up" voice. It wraps the Web Speech API
 * (spoken phrases) and a soft WebAudio chime, and drives the pure scheduler to
 * decide level / interval / volume per cycle. It escalates in warmth and
 * presence, never into a harsh alarm.
 *
 * Browsers block audio + speech until a user gesture, so `unlock()` MUST be
 * called from the tap that leads to calling (it resumes the AudioContext and
 * speaks a near-silent priming utterance). `speak()` is isolated so a cloud TTS
 * backend could be swapped in behind the same seam later.
 */
export class Caller {
  private opts: CallerOptions;
  private cycle = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private active = false;
  private ctx: AudioContext | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  /** Reported on every call so the UI can warm the sunrise and show the phrase. */
  onCall: ((info: CallInfo) => void) | null = null;

  constructor(opts: CallerOptions) {
    this.opts = { ...opts };
  }

  setOptions(patch: Partial<CallerOptions>): void {
    this.opts = { ...this.opts, ...patch };
  }

  /** Must run inside a user gesture to unlock audio + speech. */
  unlock(): void {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx && !this.ctx) {
        this.ctx = new Ctx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
    } catch {
      // AudioContext can be blocked; the visible sunrise still carries the call.
    }
    try {
      if ('speechSynthesis' in window) {
        const priming = new SpeechSynthesisUtterance(' ');
        priming.volume = 0;
        window.speechSynthesis.speak(priming);
      }
    } catch {
      // Speech can be unavailable; chimes + captions still work.
    }
  }

  /** Voices load async; call this on `voiceschanged` to re-pick. */
  resetVoice(): void {
    this.voice = null;
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    if (this.voice) {
      return this.voice;
    }
    try {
      this.voice = pickBestVoice(window.speechSynthesis.getVoices());
    } catch {
      this.voice = null;
    }
    return this.voice;
  }

  /** The spoken phrase. Isolated so a network voice could replace it. */
  protected speak(text: string, volume: number): void {
    if (!this.opts.voice || !('speechSynthesis' in window)) {
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.pickVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.88;
      utterance.pitch = 1.08;
      utterance.volume = Math.min(1, volume);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech failures.
    }
  }

  private chime(volume: number): void {
    if (!this.opts.sound || !this.ctx) {
      return;
    }
    try {
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const notes: Array<[number, number]> = [
        [523.25, 0],
        [783.99, 0.16],
      ];
      for (const [frequency, offset] of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.12 * volume, now + offset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.2);
        osc.start(now + offset);
        osc.stop(now + offset + 1.3);
      }
    } catch {
      // Ignore audio failures.
    }
  }

  private doCall = (): void => {
    if (!this.active) {
      return;
    }
    const level = levelForCycle(this.cycle);
    const text = phraseFor(level, this.cycle);
    this.chime(chimeVolume(this.cycle));
    const speakVolume = speechVolume(this.cycle);
    setTimeout(() => this.speak(text, speakVolume), 380);
    this.onCall?.({ cycle: this.cycle, level, text });
    this.cycle += 1;
    this.timer = setTimeout(this.doCall, nextIntervalMs(this.cycle));
  };

  start(): void {
    this.active = true;
    this.cycle = 0;
    this.unlock();
    this.doCall();
  }

  stop(): void {
    this.active = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore.
    }
  }
}
