import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/App';
import { PHRASES } from '@/lib/phrases';
import { createDefaultState } from '@/lib/repository';
import { useRiseStore } from '@/store/rise-store';

// Minimal speech + audio mocks so the Caller runs without a real browser engine.
beforeAll(() => {
  class FakeUtterance {
    constructor(public text: string) {}
    voice: unknown = null;
    rate = 1;
    pitch = 1;
    volume = 1;
  }
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    FakeUtterance;
  (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
    getVoices: () => [],
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  (window as unknown as { AudioContext: unknown }).AudioContext = class {
    state = 'suspended';
    currentTime = 0;
    resume() {}
    close() {}
  };
});

function reset() {
  localStorage.clear();
  const defaults = createDefaultState();
  useRiseStore.setState({ settings: defaults.settings, stats: defaults.stats });
}

beforeEach(() => {
  reset();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('setup', () => {
  it('renders both choices and is visible (no opacity-freeze regression)', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Rise' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Call me now/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Rest, then call/ })).toBeVisible();
  });
});

describe('calling', () => {
  it('moves to calling and the caller speaks a gentle first phrase', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Call me now/ }));

    // Caller starts ~200ms after the transition; advance to let it call.
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // The first phrase is from the soft (level 1) bank, shown as a caption.
    expect(screen.getByText((text) => PHRASES[1].includes(text))).toBeInTheDocument();
  });
});

describe('rest, then call', () => {
  it('shows a countdown and then begins calling when it reaches zero', () => {
    useRiseStore.getState().setRestMins(5);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Rest, then call/ }));
    expect(screen.getByText('05:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);
    });
    // Reached zero → calling. The hold-to-get-up control is present.
    expect(screen.getByRole('button', { name: 'Hold to get up' })).toBeInTheDocument();
  });
});

describe('hold to rise', () => {
  it('does not rise on a quick press in hold mode', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Call me now/ }));
    const button = screen.getByRole('button', { name: 'Hold to get up' });
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(screen.queryByRole('heading', { name: /You.?re up/ })).not.toBeInTheDocument();
    expect(useRiseStore.getState().stats.timesUp).toBe(0);
  });

  it('rises immediately on tap when hold is off, and increments times-up', () => {
    useRiseStore.getState().setHoldToRise(false);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Call me now/ }));
    fireEvent.mouseDown(screen.getByRole('button', { name: "I'm up" }));

    expect(screen.getByRole('heading', { name: /You.?re up/ })).toBeInTheDocument();
    expect(useRiseStore.getState().stats.timesUp).toBe(1);
  });
});
