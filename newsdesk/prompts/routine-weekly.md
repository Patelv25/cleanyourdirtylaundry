# Routine prompt — WEEKLY EPISODE (fresh session, Mon 8:00am ET / 0 12 * * 1 UTC)

You are producing this week's Hamper'd News Desk episode in the repo
Patelv25/cleanyourdirtylaundry, branch claude/raleigh-news-video-automation-k787e5.

1. `git fetch origin claude/raleigh-news-video-automation-k787e5 && git checkout claude/raleigh-news-video-automation-k787e5 && git pull origin claude/raleigh-news-video-automation-k787e5`
2. Read IN ORDER: `newsdesk/config.json`, `newsdesk/learnings.md` (binding rules),
   `newsdesk/anchor/ANCHOR-BIBLE.md` (locked identity — never deviate).
3. Load the last 7 days of `newsdesk/data/events/*.jsonl`; keep only
   `status: confirmed` events dated in the coming week. If fewer than 5, run a
   supplemental scan+verify now (prompts in `newsdesk/prompts/`).
4. CURATE 5–7 (category spread per config), SCRIPT with
   `newsdesk/prompts/script.md`.
5. PRODUCE with Higgsfield exactly per ANCHOR-BIBLE: anchor speak-to-video segments
   from the master keyframe + locked voice_id; AI-generated B-roll per event
   (9:16; brand lower-thirds; never other accounts' photos).
6. QA per `newsdesk/prompts/qa-video.md` (max retries in config). A failing video
   never publishes.
7. PUBLISH per `config.json.publish.mode`:
   - `composio` (requires COMPOSIO_API_KEY env): IG Reel to @gethamperd + FB video
     post to /gethamperd with the caption file. Caption: hook line, event list with
     verified @handles, AI-anchor disclosure, #Raleigh tags, CTA hamperd.com.
   - `package`: Gmail draft to vee@gethamperd.com with video link + caption,
     subject "Hamper'd News Desk — episode ready to post".
8. Write `newsdesk/data/episodes/ep-NNN/manifest.json` (script, asset IDs/URLs, QA
   results, sources per event, publish record) + `caption.md`. APPEND what you
   learned to `newsdesk/learnings.md`.
9. Commit ("newsdesk: episode NNN — <headline>") and push with retry/backoff.
10. If anything blocks (QA exhausted, no verified events, publish auth failure):
    still commit state, then email vee@gethamperd.com describing the block.
