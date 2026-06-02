import { create } from 'zustand';
import { repository } from '@/lib/repository';
import type { Accent, Settings, Stats } from '@/types/domain';

interface RiseState {
  settings: Settings;
  stats: Stats;
  /** Record a successful rise (increments the count, stamps the time). */
  recordRise: (now: number) => void;
  setRestMins: (mins: number) => void;
  setVoice: (on: boolean) => void;
  setChime: (on: boolean) => void;
  setHoldToRise: (on: boolean) => void;
  setAccent: (accent: Accent) => void;
}

const initial = repository.getState();

export const useRiseStore = create<RiseState>((set, get) => {
  function patchSettings(patch: Partial<Settings>): void {
    set({ settings: repository.setSettings(patch).settings });
  }

  return {
    settings: initial.settings,
    stats: initial.stats,

    recordRise: (now) =>
      set({ stats: repository.setStats({ timesUp: get().stats.timesUp + 1, lastAt: now }).stats }),

    setRestMins: (restMins) => patchSettings({ restMins }),
    setVoice: (voice) => patchSettings({ voice }),
    setChime: (chime) => patchSettings({ chime }),
    setHoldToRise: (holdToRise) => patchSettings({ holdToRise }),
    setAccent: (accent) => patchSettings({ accent }),
  };
});
