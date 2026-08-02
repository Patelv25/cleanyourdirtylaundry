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

## 2026-08-02 — ep-001 production

- L6: Higgsfield sandbox_exec calls are killed by the MCP client at ~55-60s regardless
  of timeout_seconds, and background:true fails to launch — chunk assembly into <55s
  foreground calls (downloads / 3 segs / 3 segs / seg0 / seg7+8 / concat+upload) and
  NEVER let a call time out: a killed call wipes the whole sandbox workspace.
- L7: wan2_7 anchor generations may trigger a bogus preset recommendation ("IN THE
  DARK") — retry immediately with declined_preset_id, don't ask.
- L8: seed_audio and wan2_7 rate-limit (429) on parallel bursts — submit ≤6 TTS at
  once, wait ~25-40s before retrying the rest.
- L9: TTS runs slower than script-read estimates (~10.9s per event beat vs ~9
  planned). atempo=1.1 at assembly fixed pacing; next time write event lines 1-2
  words shorter.
- L10: video_analysis scene timestamps drift on 60s+ videos — never treat its
  mid-video A/V pairing as a defect by itself; verify objectively with ffprobe
  stream durations + silencedetect before rebuilding (saved a full re-render).
- L11: anchor clips come back 768x1344 (not exact 9:16) — use
  scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920, never
  scale=-2:1920,crop.
- L12: ultrafast/crf20 master = 233MB for 78s; make a crf24 preview copy for phone
  delivery. Meta recompresses anyway.
- L13: Routine-fired sessions in this org run WITHOUT MCP connectors (no Higgsfield/
  Gmail) — the weekly episode Routine has a stop-after-script fallback; full
  production needs a session with connectors until org enables connector
  pass-through (or COMPOSIO_API_KEY lands in env for API-based posting).
- L14: Virality predictor caps at 16s — run it on the hook clip only.
