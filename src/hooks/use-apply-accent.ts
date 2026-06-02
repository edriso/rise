import { useEffect } from 'react';
import { useRiseStore } from '@/store/rise-store';

/** Reflects the chosen sun accent onto <html>. */
export function useApplyAccent(): void {
  const accent = useRiseStore((state) => state.settings.accent);
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);
}
