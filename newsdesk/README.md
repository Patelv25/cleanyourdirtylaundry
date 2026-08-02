# Hamper'd News Desk — Raleigh Local News Video Pipeline

A recurring multi-agent pipeline that turns verified Raleigh happenings into short
branded anchor-desk videos for **Hamper'd** (@gethamperd on Instagram + Facebook).
Pitch: *go enjoy Raleigh instead of doing laundry.*

This directory is self-contained pipeline state. It never touches the CYDL site files
and is never merged to `master` (the GitHub Pages site). It lives on the
`claude/raleigh-news-video-automation-k787e5` branch (episode runs continue on the
same branch).

## How it runs

Two scheduled Routines (Claude Code cloud sessions, cron in UTC):

| Routine | Cron (UTC) | Local | What it does |
|---|---|---|---|
| Daily scan | `0 11 * * *` | 7:00am ET | SCAN → MERGE → VERIFY; commits `data/events/YYYY-MM-DD.jsonl` |
| Weekly episode | `0 12 * * 1` | Mon 8:00am ET | CURATE → SCRIPT → PRODUCE → QA → PUBLISH → LEARN |

Each fresh session must start by reading, in order:
1. `config.json` — brand block, cadence, thresholds, publish mode
2. `learnings.md` — accumulated rules; **binding**, not suggestions
3. `anchor/ANCHOR-BIBLE.md` — the locked anchor/set/voice identity

Routine prompts to install: `prompts/routine-daily.md`, `prompts/routine-weekly.md`.

## Pipeline stages

1. **SCAN** — parallel agents, one per source lane in `config.json.sources`
   (prompt: `prompts/scan.md`). Output: candidate events.
2. **MERGE/DEDUPE** — collapse duplicates, normalize dates/venues.
3. **VERIFY** — adversarial fact-check per event (prompt: `prompts/verify-event.md`).
   Only `status: confirmed` events can air. Resolve each business's IG handle.
4. **CURATE** — pick 5–7 with category spread; prefer weekend-morning/evening events
   (that's when laundry competes).
5. **SCRIPT** — 60–90s, hook-first (prompt: `prompts/script.md`).
6. **PRODUCE** — Higgsfield: anchor speak-to-video from the locked master keyframe +
   locked `voice_id`; AI-generated B-roll per event (NEVER lift other accounts' photos);
   9:16 vertical; brand lower-thirds.
7. **QA-WATCH** — Higgsfield `video_analysis` against `prompts/qa-video.md` +
   `virality_predictor` hook check. Fail → regenerate failing segment, max 2 loops,
   then flag for human.
8. **PUBLISH** — `publish.mode` in config:
   - `composio`: post Reel to IG @gethamperd + video post to FB /gethamperd, caption
     from `data/episodes/ep-NNN/caption.md` (requires `COMPOSIO_API_KEY` env var).
   - `package`: deliver video + caption in chat and as a Gmail draft to
     vee@gethamperd.com for one-tap manual posting.
9. **LOG + LEARN** — write `data/episodes/ep-NNN/manifest.json`, append `learnings.md`,
   commit + push.

## Re-running a stage manually

Open a Claude session on this repo and say e.g. "run the newsdesk scan for today" or
"produce this week's newsdesk episode" — the prompts in `prompts/` are the single
source of truth for each stage.

## Hard rules

- Nothing airs unverified. The verification rule is in `config.json.verification`.
- The anchor face, set, voice, intro/outro, and lower-third style NEVER change
  without Vee's explicit sign-off (see `anchor/ANCHOR-BIBLE.md`).
- Never invent events, dates, prices, or quotes. Every script line traces to a
  confirmed event in that week's data files.
- Caption always carries the AI-anchor disclosure (Meta policy) and tags only
  verified-live IG handles.
- No secrets in this repo, ever (branch may become public).

---

## ⏸ PROJECT ON HOLD (2026-08-02, by Vee)

Reason: evaluating cheaper/better generation tools before scaling.

State at pause:
- Both Routines DISABLED (daily scan trig_019iTe21YiRcRuC1BuaJGZAL, weekly episode
  trig_01MhVxwBZWeG5eokNUGXo32V). Re-enable via claude.ai Routines UI or update_trigger.
- Episode 1 exists in three cuts (see data/episodes/ep-001/manifest.json). Latest =
  v3 comedy weekend-freedom format (the locked show DNA, learnings F1-F6):
  https://d2ol7oe51mr4n9.cloudfront.net/user_3BiQBfnQpWhNeBZQY2nVohh2sug/38fb3cd8-961e-46fb-9bac-3abab2188925.mp4
- Nothing was posted to Instagram/Facebook. Gmail draft with v1 package exists.
- Anchor identity, set, sting, voice engine (ElevenLabs/Brooks) all locked in
  anchor/ANCHOR-BIBLE.md + learnings.md — a resumed pipeline reproduces the exact
  same show.
- Higgsfield balance at pause: ~252 credits. Observed cost: ~90-115 credits per
  full episode render with the locked template (one-time setup/casting/revisions
  this session cost more; steady-state is the per-episode number).

To resume: open a session on this repo/branch, read this README + learnings.md,
re-enable the Routines, and (optionally) add COMPOSIO_API_KEY for auto-posting.
