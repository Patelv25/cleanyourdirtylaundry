# Learnings — append-only

Every episode run MUST read this file before producing anything, and MUST append
what it learned (QA failures, engagement signals, Vee feedback → concrete rules).
Rules here are binding on future runs.

## Seed rules (2026-08-02, pre-episode-1)

- R1: Hook lands in the first 2 seconds — name the payoff ("X things to do in Raleigh
  this week") before any branding.
- R2: One sentence per event. If it needs two, cut the event.
- R3: Total runtime 60–90s. Shorter beats longer; never pad.
- R4: B-roll is AI-generated or our own screenshots of public event pages — never
  other accounts' photos/videos (rights + partnership optics).
- R5: Never use NC State marks or wolf imagery in any visual (trademark; rule carried
  over from CYDL AGENTS.md and applies to all our content).
- R6: Anchor consistency beats novelty. Same face, desk, voice, intro, outro,
  lower-thirds every episode — recognizability is the strategy.
- R7: Every factual claim maps to a `confirmed` event row with source URLs recorded
  in the episode manifest.

## 2026-08-02 — scan run 1 (ep-001 prep)

- L1: Dedupe by normalized-name+date missed a duplicate (First Friday appeared twice
  with different name strings). Future merges: also fuzzy-match on date+venue.
- L2: This environment's egress proxy 403-blocks direct page loads on most external
  hosts; verifiers correctly fell back to multi-source web-search corroboration.
  Verify prompts should state this fallback is acceptable when ≥3 independent
  sources agree — two solid events (Crank Arm Tue run, Midtown Farmers' Market)
  went "unverified" on that technicality alone.
- L3: Verifier caught a real input error (Midtown market season ends Oct 31, not
  Nov 2) and a real understatement (Raleigh Market ~1,000 vendors, not 500+).
  Adversarial pass earns its cost — keep it.
- L4: Same-day events (tonight 6pm concert) are only usable if the episode posts
  before start time; prefer Mon–Sun-ahead events for the weekly episode.
- L5: Red Hat Amphitheater relocates for 2027 — recheck venue address next summer.
