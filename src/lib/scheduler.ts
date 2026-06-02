import type { Level } from '@/types/domain';

/*
 * The pure escalation scheduler. As cycles accrue, the calls move up in level
 * (warmth/presence), get a little more frequent (floored so it never becomes a
 * rapid alarm), and rise gently in volume (capped). No React, no timers — just
 * the numbers, so the arc is fully testable.
 */

/** The shortest a gap between calls may be (ms) — keeps it gentle. */
export const MIN_INTERVAL_MS = 7000;
const BASE_INTERVAL_MS = 16000;
const STEP_MS = 1500;

/** Level by how many cycles have already happened: soft → encouraging → warm. */
export function levelForCycle(cycle: number): Level {
  if (cycle < 2) return 1;
  if (cycle < 5) return 2;
  return 3;
}

/** The gap before the next call, given how many calls have completed. */
export function nextIntervalMs(cyclesDone: number): number {
  return Math.max(MIN_INTERVAL_MS, BASE_INTERVAL_MS - cyclesDone * STEP_MS);
}

/** Chime volume for a cycle (0..1), rising and capped. */
export function chimeVolume(cycle: number): number {
  return Math.min(1, 0.5 + cycle * 0.12);
}

/** Speech volume for a cycle (0..1), rising and capped. */
export function speechVolume(cycle: number): number {
  return Math.min(1, 0.72 + cycle * 0.09);
}
