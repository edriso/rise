# Rise

**A gentle voice to get you up.** Rise is a **frontend-only** app that coaxes you
up off the couch or out of bed with a soft, _spoken_ voice that escalates in
warmth — never in harshness — until you actually get moving. It speaks to you
(via the browser's Web Speech API), backed by a soft chime and a **sunrise that
warms the whole screen** as it calls, so it works even on mute and feels like
waking gently rather than being jolted by an alarm. Never harsh, never shaming.

There is no backend, no account, and no network. Everything lives on your device
and the app works fully offline.

---

## How it works — one page, four phases

`setup → resting (optional) → calling → up`

- **Setup** — a calm night screen: pick **Call me now** (gentle calls start at
  once) or **Rest, then call** (lie back for N minutes, default 15, then it
  begins). A tiny "you've risen with me N times" stat.
- **Resting** — a quiet countdown until the calling begins, with "Call me now"
  and "Cancel".
- **Calling** (the heart) — the background warms from night to dawn and a **sun
  rises** and brightens with each call; a large serif line shows the phrase being
  spoken; the voice escalates gently (soft → encouraging → warm and present).
  A **"Hold to get up"** button (hold ~1.3s so you can't dismiss it half-asleep,
  switchable to a plain tap) and a quiet "not yet, give me a moment" link.
- **Up** — the sky warms fully to dawn: "You're up. That was the hardest part."

### The voice/audio engine (the differentiator)

The `Caller` (in `src/lib/caller.ts`) is a small, testable class wrapping the Web
Speech API and WebAudio:

- **Phrases** are banked by gentle level (1 soft → 3 warm/present) and escalate in
  warmth, never harshness. They never shame.
- **It picks the most natural _female_ voice available.** Device voices vary
  wildly, so `voice-scoring.ts` scores the list — preferring "Natural"/neural
  voices, online (non-local) voices, Google voices, and known good female names,
  while penalizing male names and the robotic "compact/eloquence" voices — and
  re-picks when the (async) voice list loads. Prosody is tuned warm
  (`rate ≈ 0.88`, `pitch ≈ 1.08`).
- **Escalation** is a pure scheduler: each call moves up a level on schedule, the
  gap shortens (floored at 7s so it stays gentle), and the volume rises and caps.

---

## Honest limitations (worth knowing)

- **Voice quality is device-dependent.** A web app can only use the voices
  installed on your device, so the ceiling varies: modern "Natural" (Microsoft),
  Apple, and Google voices sound human; older default voices less so. The
  `speak()` call is kept behind a seam, so a cloud text-to-speech backend could
  be swapped in later for guaranteed quality on every device.
- **A fully locked phone may suspend timers and audio.** Rise leans on "keep the
  screen on", the **visible sunrise**, and the **on-screen phrase (captions, so
  it's never audio-only)**, and uses the **Screen Wake Lock API** (feature-
  detected) during resting/calling to keep the screen awake.
- **Audio needs a tap to start.** Browsers block audio and speech until a user
  gesture, so the first tap (Call me now, or starting a rest) unlocks them.

---

## Tech stack

- **React 19 + TypeScript** (strict), built with **Vite**
- **Tailwind CSS v4** (configured in CSS with `@theme`, no `tailwind.config.js`)
- **Zustand** for state (no router — it's one page with phases)
- **Zod** validates the persisted shape
- **vite-plugin-pwa** for offline/installable; **Screen Wake Lock API** during
  resting/calling
- **Vitest** + **Testing Library** for unit and component tests, **Playwright**
  for browser tests (it uses the clock API to fast-forward the calling cycles)

---

## Getting started

You need **Node 20+** and **pnpm** (`npm install -g pnpm`).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. There is nothing else to configure — no backend.

---

## Commands

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                 |
| `pnpm build`     | Type-check and build for production       |
| `pnpm preview`   | Preview the production build locally      |
| `pnpm lint`      | Run ESLint (must pass with zero warnings) |
| `pnpm format`    | Format every file with Prettier           |
| `pnpm typecheck` | Type-check without building               |
| `pnpm test`      | Run the unit and component tests (Vitest) |
| `pnpm test:e2e`  | Run the browser tests (Playwright)        |

Run `pnpm test:e2e:install` once to download the browser before `pnpm test:e2e`.

---

## How it is built

```
src/
├── components/      overlay + the settings panel
├── features/
│   ├── setup/       the night choice screen
│   ├── resting/     the countdown
│   ├── calling/     the sunrise + caption + hold-to-rise button
│   └── up/          the "you're up" screen
├── store/           the Zustand store (settings + stats)
├── hooks/           caller, interval, wake-lock, apply-accent
├── lib/             caller, voice-scoring, scheduler, phrases, repository, format
├── types/           Zod schemas and the types they produce
└── styles/          the sunrise theme + layout CSS
```

A few ideas worth knowing:

- **The hard logic is pure and tested.** The escalation `scheduler` (level /
  interval / volume per cycle) and the `voice-scoring` function have no DOM, so
  they are unit-tested directly. The `Caller` wraps them with `speechSynthesis`
  and WebAudio.
- **Saving goes through one seam.** `lib/repository.ts` is a small typed interface
  over localStorage; saved data is parsed with Zod, so an old or corrupt shape
  safely falls back to defaults.

### ⚠️ One animation gotcha that's deliberately fixed

Entrance animations never animate `opacity` from 0 with `animation-fill-mode:
both` — in some webview/capture contexts that freezes at frame 0 and leaves the
element **stuck invisible** (it once hid the whole setup screen). Every entrance
keeps `opacity: 1` and animates only `transform`.

---

## Accessibility & motion

- Every control is keyboard-operable with a visible focus ring; the settings
  dialog traps focus and closes on Escape.
- **The sunrise is never the only signal:** the spoken phrase is always shown on
  screen (captions), so the app works with sound off and for anyone who can't
  hear it.
- The app honors `prefers-reduced-motion` (no alarm-like motion; the sun settles)
  and the controls over the bright sun get contrast treatments so they stay
  legible.

---

## License

MIT.
