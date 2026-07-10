# AGENTS.md — rules for ANY coding agent working on this repo
(Codex, ChatGPT, Claude, or human. These rails are non-negotiable.
Written by Jarvis, Jul 10 2026. The system of record is Claude Code —
work here lands as a BRANCH + PR for Jarvis review, never direct to master.)

## What this is
The live CYDL launch site — https://cleanyourdirtylaundry.com
(GitHub Pages, master branch, custom domain). Single-file architecture:
`index.html` (five-chapter scroll story) + `parents.html` + static assets.
Design contract: `V3-SPEC.md` (this repo). Character/art canon:
`../universe/CYDL-UNIVERSE.md`.

## HARD RAILS — violating any of these = the change is rejected
1. **Facts are locked.** $100/mo flat · one 20 lb bag/week HARD cap ·
   comforter $20 add-on · sheets/linens "priced at signup" (NO number
   exists) · pickup Tue, back Thu · launch = Packapalooza, Saturday
   **Aug 22** 2026 · move-in Aug 14–16. NEVER invent prices, dates,
   reviews, testimonials, stats, or a phone number. NO "$49 first month"
   anywhere (undecided). The facility is "a commercial laundromat on
   North Raleigh Boulevard" — never name WaveMax.
2. **Palette is locked.** Soft Navy #1E2A38 (deep #16202B), Powder Rinse
   #E6F0FA, Skywash #7FBFE9, blue-grey #8FA3B8. **Lemon Zest #FFD24D
   appears ONLY on CTAs (.btn) + the home-base route node.** Character
   art additionally allows heart-gold #C9A227 on the Bag's heart + glow
   ONLY. No other colors. No warm golds/creams in artwork.
3. **Characters are canon.** The Pile: smug-sleepy (heavy lids, tiny
   smile), never manic/evil, faces on the Pile ONLY. The Bag: an OBJECT
   — no face, no legs, no arms, gold heart tag. No wolf imagery, no NC
   State marks/mascots.
4. **Do not touch:** `CNAME` · `founders-count.json` (a watcher
   process owns it) · the waitlist form's action URL, hidden fields, or
   element ids (`waitlist-form`, `submit-btn`, `success-box`,
   `spots-live` — automation depends on them) · `robots.txt`/`sitemap.xml`
   URLs.
5. **Accessibility + motion:** every new animation needs a
   `prefers-reduced-motion` fallback; content must work no-JS; WCAG AA
   contrast; decorative SVG = aria-hidden, meaningful SVG = labeled.
6. **Voice:** deadpan, dry, receipts-first. Short sentences. No hype
   words, no exclamation marks, no "revolutionary."

## Working here
- Serve locally: `python3 -m http.server 8901` → check console is clean,
  test at 1280px AND 375px (no horizontal scroll).
- Keep the single-file pattern: CSS in `<style>`, no external deps, no
  frameworks, no build step. Reuse the existing systems (`.reveal`,
  `[data-stagger]`, `data-tear`, `.plate`, `.charm` + SVG symbol library
  in `index.html`).
- Branch naming: `codex/<task>` or `feature/<task>`. Open a PR; Jarvis
  runs verification (Playwright + palette gate) before merge. Never
  push to master directly.

## Good tasks for agents in this repo
Campus landing pages (/ncsu.html etc. — mirror parents.html's
self-contained pattern, facts from rail #1 only), FAQ additions from
approved copy, CSS polish, a11y fixes, Rive embed scaffolding
(fallbacks per rail #5).
