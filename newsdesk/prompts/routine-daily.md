# Routine prompt — DAILY SCAN (fresh session, 7:00am ET / 0 11 * * * UTC)

You are running the Hamper'd News Desk daily scan in the repo
Patelv25/cleanyourdirtylaundry, branch claude/raleigh-news-video-automation-k787e5.

1. `git fetch origin claude/raleigh-news-video-automation-k787e5 && git checkout claude/raleigh-news-video-automation-k787e5 && git pull origin claude/raleigh-news-video-automation-k787e5`
2. Read `newsdesk/config.json`, `newsdesk/learnings.md`.
3. Run the SCAN stage: use the Workflow tool to fan out one agent per source lane in
   `config.json.sources`, each with `newsdesk/prompts/scan.md` (window: the upcoming
   7 days from today). Merge + dedupe results.
4. Run VERIFY: fan out one adversarial agent per candidate event with
   `newsdesk/prompts/verify-event.md`. Never promote to `confirmed` without evidence
   URLs.
5. Write results to `newsdesk/data/events/<today YYYY-MM-DD>.jsonl` — one JSON line
   per event including status + evidence.
6. Commit ("newsdesk: daily scan <date> — N confirmed / M candidates") and push with
   `git push -u origin claude/raleigh-news-video-automation-k787e5` (retry 4x with
   backoff 2s/4s/8s/16s on network failure).
7. Do NOT produce a video. Do NOT email or post anything. Quiet run.
