import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageRepository, type Repository } from './repository';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
}

describe('localStorage repository', () => {
  let repo: Repository;
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    repo = createLocalStorageRepository(storage);
  });

  it('returns sensible defaults when nothing is stored', () => {
    const state = repo.getState();
    expect(state.version).toBe(1);
    expect(state.settings.restMins).toBe(15);
    expect(state.settings.voice).toBe(true);
    expect(state.stats.timesUp).toBe(0);
  });

  it('falls back to defaults on corrupt JSON', () => {
    storage.setItem('rise-v1', 'not json');
    expect(repo.getState().settings.accent).toBe('#f6a35c');
  });

  it('falls back to defaults on a wrong shape', () => {
    storage.setItem('rise-v1', JSON.stringify({ version: 1, settings: {} }));
    expect(repo.getState().settings.restMins).toBe(15);
  });

  it('rejects an out-of-range rest length', () => {
    storage.setItem(
      'rise-v1',
      JSON.stringify({
        version: 1,
        settings: { restMins: 999, voice: true, chime: true, holdToRise: true, accent: '#f6a35c' },
        stats: { timesUp: 0, lastAt: null },
      }),
    );
    expect(repo.getState().settings.restMins).toBe(15);
  });

  it('round-trips settings and stats', () => {
    repo.setSettings({ voice: false, restMins: 30, accent: '#e0795a' });
    repo.setStats({ timesUp: 4, lastAt: 123 });
    const after = repo.getState();
    expect(after.settings.voice).toBe(false);
    expect(after.settings.restMins).toBe(30);
    expect(after.stats.timesUp).toBe(4);
    expect(after.stats.lastAt).toBe(123);
  });
});
