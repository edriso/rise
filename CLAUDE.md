# CLAUDE.md — Rise

Project memory for Claude Code. Read this before doing anything. Keep edits aligned with it; if you intentionally diverge, update this file in the same change.

## What Rise is

A **frontend-only** app that gently calls you up off the couch / out of bed with a soft, **spoken** voice that escalates in warmth (never harshness) until you actually get up. Tagline: **"A gentle voice to get you up."**

It **speaks** to you (Web Speech API), backed by a soft chime and a **sunrise that warms the screen** as it calls — so it works on mute and feels like waking gently, not an alarm. Never harsh, never shaming. No backend, no accounts; all state local; works offline.

> Keep it minimal: **one page, four phases.** No alarm lists, snooze stacks, sleep tracking, accounts.

## Product shape — phase state machine

`setup → resting (optional) → calling → up`

- **setup** — night screen: sun mark, "Rise" title, subtitle, two choices: **Call me now** (calls begin at once) and **Rest, then call** (lie back N min, default 15, then call). Tiny "risen N times" stat.
- **resting** — quiet countdown ("I'll gently call you in mm:ss") + "Call me now" / "Cancel".
- **calling (the heart)** — full-screen **sunrise**: bg warms night→dawn and a **sun rises** + brightens as it calls; a large serif line shows the current spoken phrase; the Caller speaks escalating encouragement; a **"Hold to get up"** button (hold ~1.3s; tweakable to tap) + a quiet "not yet, give me a moment" link.
- **up** — sky fully dawn; "You're up. That was the hardest part." + "Done"; increments times-risen.

## The voice/audio engine (`lib` Caller — the differentiator)

A plain, testable class wrapping `speechSynthesis` + WebAudio:

- **Phrases** in banks by gentle **level** (1 soft → 3 warm/present), escalating in warmth not harshness. **No em dashes** — write like a human speaks (commas/periods). Arc examples:
  - L1: "Hey. No rush, but let's start thinking about getting up." / "Whenever you're ready. I'm right here with you."
  - L2: "Come on, you've got this. Just sit up first." / "One small move. Let's rise together."
  - L3: "Up you get. You'll feel better the moment you're moving." / "On your feet now. I believe in you."
- **Natural FEMALE voice selection (do NOT regress to the robotic default):** score `getVoices()` toward the most natural female voice available — prefer `natural|neural`, `localService === false` (online = richer), Google voices, known female names (Aria, Jenny, Sonia, Libby, Michelle, Emma, Ava, Samantha, Serena, Karen, Moira, Tessa, Fiona, Zira, Hazel…); **penalize** male names + `compact|eloquence`. Re-pick on `voiceschanged` (async load). Prosody: `rate ≈ 0.88`, `pitch ≈ 1.08` for warmth.
- **Chime:** soft two-note WebAudio sine under each call (toggleable).
- **Escalation:** call → wait `max(7s, 16s − cycle·1.5s)`, volume rises and caps gently. `onCall({cycle, level, text})` → UI bumps sunrise intensity + shows the phrase.
- **Audio-unlock reality:** browsers block audio/speech until a user gesture. `unlock()` on the tap that starts/leads to calling (resume AudioContext + speak a near-silent priming utterance); for "Rest, then call", unlock on the initial tap so later calls work.

### Honest limitations (keep in README + UI copy)

- A web app can only use **voices installed on the device** → quality ceiling is device-dependent (Google + new MS/Apple "Natural" voices are human-like; old defaults less so). Put the `speak()` call behind a seam so a **cloud TTS** could be swapped in later.
- A fully **locked phone** may suspend timers/audio → lean on "keep the screen on" + the **visible sunrise** + the on-screen phrase text (captions), and use the **Screen Wake Lock API** (feature-detected) during resting/calling.

## Design system — a sunrise you can hear

- **Concept = sunrise.** Night→dawn gradient interpolated by `intensity` (0→1) driven by calling cycles + slow drift; a glowing **sun disc** rises from the bottom and brightens. Dual visual+audio signal is core (works on mute, gentle).
- Palette: night `#161430`/`#1d1a3a`/`#25224a` → dawn `#2a2350`/`#c96f5a`/`#f6b06a`; sun accent `#f6a35c` (tweakable: amber/peach/coral/rose). Light text on dark/warm sky.
- **Type:** **Fraunces** (warm serif) for title, phrases, big timer; **Hanken Grotesk** for UI.
- **Legibility over the bright sun (don't regress):** the "not yet" link = subtle blurred dark pill + light text + text-shadow; the "Done" CTA = light ring (`border` + `box-shadow` halo) so it separates from the same-colored sun; hold-button label has a text-shadow.
- Driven by CSS custom properties. Honor `prefers-reduced-motion`; no alarm-like motion.

### ⚠️ Animation gotcha (bit this project twice — keep the fix)

Never animate `opacity` from 0 with `animation-fill-mode: both` for entrances — in some webview/capture contexts the animation freezes at frame 0 and the element is **stuck invisible** (this hid the whole setup screen). **Base state `opacity: 1`; animate only `transform`; no `both` fill.** Applies to every screen.

## Tech & architecture

- **React 19 + TypeScript (strict)**, **Vite**, **Tailwind v4** (CSS-first `@theme`, no config; Node 20+).
- **Zustand** (phase/settings/stats); one page + phases, **no router**. **Zod** for persisted-shape validation.
- **Persistence behind a typed `repository`** over localStorage (times risen, settings); components never touch storage directly.
- **Caller** = plain TS class in `lib/` (unit-tested in isolation) + a thin React hook. **Wake Lock** feature-detected during resting/calling.
- **PWA:** installable, offline-first (vite-plugin-pwa + manifest, sunrise icon).
- Folders: `components/`, `features/{setup,resting,calling,up}/`, `store/`, `lib/` (caller, voice-scoring, scheduler, repository, phrase banks), `types/`, `styles/`. Co-locate tests.

### Conventions

- Naming: `PascalCase` components/types · `camelCase` functions/vars · `kebab-case` files · `SCREAMING_SNAKE_CASE` constants. One component per file; keep small.
- No `any` (`unknown` + narrowing). **Discriminated union for `Phase`** and Caller state. Path aliases.
- **Pure, unit-tested logic** for the escalation scheduler, the voice-scoring function, and the rest countdown — out of components.
- Accessibility: keyboard-operable, focus management across phases, ARIA labels, visible focus rings, reduced-motion fallbacks; **the spoken phrase is always shown on screen** (captions — never audio-only).

## Commands

```bash
pnpm install
pnpm dev          # vite dev server
pnpm build        # type-check + production build
pnpm preview      # preview the build
pnpm lint         # eslint, zero warnings
pnpm format       # prettier --write
pnpm test         # vitest (unit + component)
pnpm test:e2e     # playwright
```

Husky: pre-commit runs Prettier + ESLint on staged files; pre-push runs type-check + unit tests. Conventional Commits (commitlint).

## Definition of done

Lint clean (zero warnings), `tsc` clean, unit/component/e2e green (scheduler, voice-scoring, and the setup-visibility regression especially), builds, **installs and runs offline**, keyboard-accessible, reduced-motion safe, speaks with the **most natural available female voice**, and faithful to this design system — a sunrise you can hear, warm and gentle, never harsh or shaming. The prototype (`Rise.html` + `rise-engine.js` + `rise-app.jsx`) is the source of truth for the phases, the Caller (escalation + voice scoring + unlock), the sunrise, and the copy; port it faithfully. Two things that MUST hold: **the setup screen is visible on load** (no opacity-freeze), and **the voice is not the robotic default**.
