# HAMPER'D reels — post kit
(Brand: HAMPER'D only. Nothing in this folder contains CYDL artwork —
per Vee's Aug 2 2026 ruling, all world/character art is CYDL-only, so
Hamper'd creative is licensed footage + typography until Hamper'd gets
its own commissioned art. Aug 2 2026.)

Two finished ads, in posting order:
1. `hamperd-x-miriamj-edit-v1.mp4` — 21.1s · the licensed creator edit
   (Miriam J's fitted-sheet reel + our typography outro). **Post only
   after her written permission is on file** — see its section below.
2. `hamperd-reel-v2-fitted-sheet.mp4` — 16.2s · typography-only
   fitted-sheet reel. Zero dependencies, post any time.
   Cover: `hamperd-reel-v2-cover.png`; alt cover:
   `hamperd-reel-cover-endcard.png`.

Both masters except the licensed edit are silent on purpose: add audio
in the Instagram/TikTok editor at post time. Business accounts must use
each platform's COMMERCIAL sound library for ads.

## Licensed creator edit (`hamperd-x-miriamj-edit-v1.mp4`)
Miriam J (@epitomeofclassy) fitted-sheet reel, used with her permission
per Vee (Aug 2 2026), trimmed to 14.6s + our verdict beat and end card.
Her natural dryer/fabric audio is kept (fades out at the cut); the tonal
audio tail at the end of her original was cut on purpose — her
permission would not cover third-party music.

BEFORE posting:
1. Get the permission in writing (a DM screenshot works, a signed
   release is better) and keep it on file. Scope it: Instagram + TikTok,
   organic and paid, no end date (or whatever she agreed to).
2. Credit her in the caption (below).

Instagram caption:
The fitted sheet won this round. It always does.
(filmed by @epitomeofclassy — used with permission)
One bag outside your door, once a week. It comes back folded, flat, calm.
Let Hamper'd take care of this mess. So you don't have to.
Raleigh · hamperd.com (link in bio)
#raleigh #raleighnc #washandfold #laundryservice #fittedsheet #laundryday

TikTok caption:
The fitted sheet won. It always wins. (filmed by @epitomeofclassy, with
permission.) Let Hamper'd take care of this mess, so you don't have to.
Raleigh wash-and-fold — hamperd.com
#raleigh #laundrytok #fittedsheet #washandfold #cleantok

Audio note: this file HAS audio (her dryer sounds). Do not stack a loud
trending sound over her performance — if you add music in-app, keep it
under the ambience, commercial library only.

## Reel v2 — fitted-sheet edition, typography (`hamperd-reel-v2-fitted-sheet.mp4`)
16.2s · silent master · kinetic type only, no artwork.
Beats: "The fitted sheet has your towels." → "Negotiations have
stalled." → "Send in the bag." → "Flat sheets. Somehow." → end card.

Instagram caption:
The fitted sheet has your towels. It is not negotiating.
One bag, once a week. Sheets come back flat. Somehow.
Let Hamper'd take care of this mess. So you don't have to.
Raleigh · hamperd.com (link in bio)
#raleigh #raleighnc #washandfold #laundryservice #fittedsheet #laundryday

TikTok caption:
The fitted sheet is not negotiating. Send in the bag.
Raleigh wash-and-fold, delivered — hamperd.com
#raleigh #laundrytok #fittedsheet #washandfold #cleantok

## Posting checklist
1. Audio in-app, commercial library, volume low — the type does the
   talking.
2. Pin a comment with the plain link: hamperd.com
3. No extra platform text overlays — safe zones are already respected.
4. Post windows: Sunday evening or Monday morning (laundry dread peaks).

## Posting cadence for the set
Day 1: the licensed edit (once written permission is on file).
Day 3-4: reel v2 — reads as a running bit, not a repost.
Then switch to `hamperd-trend-playbook.md` for the next formats
(re-films need no artwork at all — one phone, one performer).

## Voice rails (Hamper'd)
- Deadpan, dry, short sentences, no exclamation marks.
- No prices, no phone number, no invented reviews/stats.
- Lemon Zest appears only on the CTA pill.
- No CYDL artwork, wordmarks, or characters. Ever.

## Re-rendering
Typography reel: `src/reel3.html` + `python3 src/render3.py movie`
(output name is `hamperd-reel3.mp4`; rename on copy). The licensed
edit's outro and assembly: `src/outro.html`, `src/tag.html`,
`src/render_outro.py`, `src/assemble.sh`. Legacy CYDL-art sources
(`src/reel.html`, `src/reel2.html`) remain only for converting the
`ads/cydl-candidates/` reels to CYDL branding.
