import type { Level } from '@/types/domain';

/*
 * Phrase banks by gentle level (1 soft → 3 warm & present). They escalate in
 * warmth and presence, never in harshness, and never shame. Written the way a
 * person speaks — commas and periods, no em dashes.
 */
export const PHRASES: Record<Level, readonly string[]> = {
  1: [
    "Hey. No rush, but let's start thinking about getting up.",
    "Whenever you're ready. I'm right here with you.",
    "A little nudge. Let's rise soon, okay?",
  ],
  2: [
    "Come on, you've got this. Just sit up first.",
    "One small move. Let's rise together.",
    'You can do this. Slowly, up we go.',
  ],
  3: [
    "Up you get. You'll feel better the moment you're moving.",
    'On your feet now. I believe in you.',
    "Let's go. Just stand up, and the rest will follow.",
  ],
};

/** The phrase for a given level and cycle (wraps within the bank). */
export function phraseFor(level: Level, cycle: number): string {
  const bank = PHRASES[level];
  return bank[cycle % bank.length];
}
