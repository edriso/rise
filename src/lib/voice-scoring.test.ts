import { describe, expect, it } from 'vitest';
import { pickBestVoice, scoreVoice, type VoiceLike } from './voice-scoring';

function v(name: string, lang = 'en-US', localService = true): VoiceLike {
  return { name, lang, localService };
}

describe('scoreVoice', () => {
  it('rewards natural/neural, online, google, and female voices', () => {
    expect(scoreVoice(v('Microsoft Aria Online (Natural)', 'en-US', false))).toBeGreaterThan(
      scoreVoice(v('Microsoft David', 'en-US', true)),
    );
    expect(scoreVoice(v('Google US English', 'en-US'))).toBeGreaterThan(scoreVoice(v('Fred')));
  });

  it('penalizes male and robotic compact/eloquence voices', () => {
    expect(scoreVoice(v('Daniel'))).toBeLessThan(0);
    expect(scoreVoice(v('Eloquence Reed'))).toBeLessThan(scoreVoice(v('Reed')));
  });
});

describe('pickBestVoice', () => {
  it('returns null for an empty list', () => {
    expect(pickBestVoice([])).toBeNull();
  });

  it('prefers the most natural female voice available', () => {
    const voices = [
      v('Microsoft David Desktop', 'en-US'),
      v('Microsoft Aria Online (Natural)', 'en-US', false),
      v('Google US English', 'en-US'),
      v('Albert', 'en-US'),
    ];
    expect(pickBestVoice(voices)?.name).toBe('Microsoft Aria Online (Natural)');
  });

  it('falls back to the whole list when there is no English voice', () => {
    const voices = [v('Amélie', 'fr-FR'), v('Kyoko', 'ja-JP')];
    expect(pickBestVoice(voices)).not.toBeNull();
  });

  it('prefers an English voice over a higher-scoring non-English one', () => {
    const voices = [
      v('Google Natural Online', 'fr-FR', false), // scores high but French
      v('Samantha', 'en-US'), // plain English female
    ];
    expect(pickBestVoice(voices)?.lang).toMatch(/^en/i);
  });
});
