import { z } from 'zod';

/** Sun accent swatches. */
export const ACCENTS = ['#f6a35c', '#f2c14e', '#ef8a6a', '#e0795a', '#f0a6b0'] as const;
export const accentSchema = z.enum(ACCENTS);
export type Accent = z.infer<typeof accentSchema>;

export const settingsSchema = z.object({
  restMins: z.number().int().min(5).max(45),
  voice: z.boolean(),
  chime: z.boolean(),
  holdToRise: z.boolean(),
  accent: accentSchema,
});
export type Settings = z.infer<typeof settingsSchema>;

export const statsSchema = z.object({
  timesUp: z.number().int().nonnegative(),
  lastAt: z.number().nullable(),
});
export type Stats = z.infer<typeof statsSchema>;

export const persistedStateSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  stats: statsSchema,
});
export type PersistedState = z.infer<typeof persistedStateSchema>;

/** The one-page phase machine. */
export type Phase = 'setup' | 'resting' | 'calling' | 'up';

/** A gentle escalation level: 1 soft → 3 warm and present. */
export type Level = 1 | 2 | 3;

/** What the Caller reports on each call, so the UI can react. */
export interface CallInfo {
  cycle: number;
  level: Level;
  text: string;
}

export interface CallerOptions {
  sound: boolean;
  voice: boolean;
}
