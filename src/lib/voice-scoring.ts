/*
 * Pure voice scoring. Device voices vary wildly in quality, so we score the
 * available voices toward the most natural-sounding FEMALE one and pick the
 * best. This is the difference between a warm companion and the robotic default.
 * Kept pure (takes a plain list) so it is fully testable without a browser.
 */

/** The minimal shape we need from a SpeechSynthesisVoice. */
export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
}

const FEMALE =
  /(aria|jenny|jane|sonia|libby|michelle|emma|ava|nora|clara|samantha|serena|karen|moira|tessa|fiona|zira|hazel|allison|susan|female|woman)/;
const MALE = /(daniel|david|mark|george|james|fred|albert|alex|male|\bman\b|rishi|oliver)/;

export function scoreVoice(voice: VoiceLike): number {
  const name = (voice.name || '').toLowerCase();
  let score = 0;
  if (/natural|neural/.test(name)) score += 70; // MS "Natural" / neural voices
  if (voice.localService === false) score += 30; // online voices are far richer
  if (/google/.test(name)) score += 35; // Google voices are smooth
  if (FEMALE.test(name)) score += 45; // known good female voices
  if (/en[-_]?gb/i.test(voice.lang)) score += 6; // a soft, warm accent
  if (MALE.test(name)) score -= 60; // avoid male voices
  if (/compact|eloquence/.test(name)) score -= 25; // the most robotic ones
  return score;
}

/**
 * Pick the best voice from a list. Prefers English voices; if there are none,
 * scores the whole list. Returns null for an empty list.
 */
export function pickBestVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  if (voices.length === 0) {
    return null;
  }
  const english = voices.filter((voice) => /^en/i.test(voice.lang));
  const pool = english.length > 0 ? english : voices;
  // Stable sort by score, descending; ties keep their original order.
  const ranked = pool
    .map((voice, index) => ({ voice, index, score: scoreVoice(voice) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0]?.voice ?? null;
}
