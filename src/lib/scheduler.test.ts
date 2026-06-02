import { describe, expect, it } from 'vitest';
import {
  chimeVolume,
  levelForCycle,
  MIN_INTERVAL_MS,
  nextIntervalMs,
  speechVolume,
} from './scheduler';

describe('levelForCycle', () => {
  it('escalates soft → encouraging → warm at the right cycles', () => {
    expect(levelForCycle(0)).toBe(1);
    expect(levelForCycle(1)).toBe(1);
    expect(levelForCycle(2)).toBe(2);
    expect(levelForCycle(4)).toBe(2);
    expect(levelForCycle(5)).toBe(3);
    expect(levelForCycle(20)).toBe(3);
  });
});

describe('nextIntervalMs', () => {
  it('shortens as cycles accrue', () => {
    expect(nextIntervalMs(0)).toBe(16000);
    expect(nextIntervalMs(1)).toBe(14500);
    expect(nextIntervalMs(2)).toBe(13000);
  });

  it('never drops below the gentle floor', () => {
    expect(nextIntervalMs(6)).toBe(7000);
    expect(nextIntervalMs(20)).toBe(MIN_INTERVAL_MS);
    expect(nextIntervalMs(1000)).toBe(MIN_INTERVAL_MS);
  });
});

describe('volumes', () => {
  it('rise with the cycle and cap at 1', () => {
    expect(chimeVolume(0)).toBeCloseTo(0.5);
    expect(chimeVolume(2)).toBeCloseTo(0.74);
    expect(chimeVolume(100)).toBe(1);
    expect(speechVolume(0)).toBeCloseTo(0.72);
    expect(speechVolume(100)).toBe(1);
  });
});
