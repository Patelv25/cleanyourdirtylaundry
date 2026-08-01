# THE ALGORITHM KNOWS — CYDL paid/organic social campaign

Ten posts for Facebook + Instagram, Aug 3 → Aug 22 2026 (launch = Packapalooza,
Sat Aug 22).

## Which brand this is

**CYDL — Clean Your Dirty Laundry.** The campus brand: NC State, student
housing, dorms, move-in, Packapalooza, the $100/mo student bag. CYDL's own
navy/powder palette, Archivo Black + Inter, the heart-tag lockup, and the
Pile-and-Bag characters.

**Not Hamper'd.** `hamperd.com` is the sibling Raleigh household + commercial
brand — as the site footer puts it, *"CYDL is the campus brand… the Raleigh
household version is Hamper'd."* Same facility and same route, but a different
site, logo, audience and set of accounts. Nothing in this campaign is Hamper'd's
and none of it may be published to a Hamper'd account. `verify.mjs` fails the
build if Hamper'd is mentioned, if the copy drifts into the residential or
commercial lane, or if any artwork comes from outside CYDL's own set.

**Post to these accounts and no others** (taken from `index.html`'s schema.org
`sameAs` block, and re-checked against it on every verify run):

- Instagram — **@cleanyourdirtylaundry**
- Facebook — **CYDL**, `facebook.com/profile.php?id=61592741337111`

Both are also stamped on every row of `schedule/queue.csv` and `queue.json`.

**The hook.** Every post opens by admitting the ad is targeted, then names the
specific domestic evidence that got you targeted — the chair, the sock ration,
the sheets that haven't moved since move-in. The reader's own suspicion, said
out loud first, in the deadpan CYDL voice. No hype, no exclamation marks.

Open `preview.html` for the contact sheet.

---

## What's here

```
campaign.json          the single source of truth — copy, art, schedule, facts
out/<post>/            rendered creative (jpg stills, mp4 reels)
schedule/queue.csv     one row per post: date, time, placements, media, caption
schedule/queue.json    the same, for anything driving the Meta Graph API
schedule/captions.md   copy-paste captions, first comments, alt text
preview.html           contact sheet of all ten posts
build/                 the renderer, the queue generator, and the gate
```

## The ten posts

| # | Name | Format | Publish (ET) | Hook |
|---|------|--------|--------------|------|
| P01 | The Chair | Feed 4:5 + 1:1 | Mon Aug 3, 18:30 | You didn't search for this. |
| P02 | The Evidence | Carousel, 5 slides | Wed Aug 5, 20:00 | How did they know? |
| P03 | 1:47 AM | Reel 9:16 + still | Fri Aug 7, 19:30 | It's 1:47 AM. And yet. Here we are. |
| P04 | The Sock Count | Feed 4:5 + 1:1 | Mon Aug 10, 22:45 | It counted your socks. |
| P05 | The Sheets | Carousel, 3 slides | Wed Aug 12, 18:00 | Your sheets gave you up. |
| P06 | Move-In Week | Feed 4:5 + 1:1 | Fri Aug 14, 12:30 | You haven't unpacked. It already knows. |
| P07 | For You Chair | Story 9:16 | Sun Aug 16, 17:00 | For You Page. Not For You Chair. |
| P08 | The Person Paying | Feed 4:5 + 1:1 | Tue Aug 18, 08:15 | It didn't send this to them. It sent it to you. |
| P09 | It Knows Your Tuesday | Carousel, 4 slides | Thu Aug 20, 19:00 | It knows your Tuesday. |
| P10 | Founding Numbers | Reel 9:16 + stills | Sat Aug 22, 09:00 | The algorithm was right. You do hate it. |

P08 is the parent lane — same premise, different target, and it points at
`parents.html` instead of the waitlist.

## Publishing

Nothing here posts itself: this session has no Meta connector, so the queue is
built for a human (or Business Suite's bulk upload) to load. For each row in
`schedule/queue.csv`:

1. Upload the files listed in `media_files`, in filename order — carousel
   slides are numbered `-01`…`-05` and must stay in that order.
2. Paste `caption`, set `alt_text` on every image, schedule at
   `publish_date` + `publish_time` **America/New_York**.
3. Post `first_comment` immediately after publish (it carries the operational
   detail that would bloat the caption).

Instagram takes the 4:5 and 9:16 files. Facebook takes the 1:1 for feed posts
and the same 9:16 for Reels/Stories. Reels are H.264/MP4, 1080×1920, 30 fps.

## Rebuilding

```bash
cd build
npm install
node render.mjs          # all creative  (--stills to skip video; or pass P03 P10)
node schedule.mjs        # queue.csv, queue.json, captions.md, preview.html
node verify.mjs          # facts + palette gate — run before you ship
```

Everything renders offline from vendored fonts and the repo's own artwork. No
network, no external requests, no design tool in the loop.

### verify.mjs

Three gates, mirroring `AGENTS.md`:

- **Facts** — scans every line of copy for `$49`, a phone number, the facility's
  real name, wolf references, exclamation marks, hype words, invented stats, a
  price other than `$100/mo`, a cap other than `20 lb`, or a number attached to
  sheets/linens.
- **Brand** — fails on any Hamper'd mention, on copy aimed at the residential or
  commercial lane, on artwork outside the CYDL `blue-*` set, and if the queue's
  target accounts stop matching `index.html`.
- **Palette** — fails if any character cutout has an opaque background (it would
  render as a white box), or if more than 0.5% of a frame's pixels sit outside
  the navy/powder/sky hue band or the lemon/heart-gold band.

Verified by planting faults: a Hamper'd cross-sell, a warm-palette asset and a
`$49` hook were each caught.

## Art

The creative uses the repo's own `assets/world/blue-*.webp` set — the v2.1
brand-bible artwork. The earlier warm/cream cuts (`chair-buried`,
`pile-standing`, `pile-on-*`, `washing-machine`, `truck-a`) are **not** used:
rail #2 bans warm golds and creams in artwork, and the palette gate catches
them if they creep back in.

Faces stay on the Pile only. The Bag stays an object — no face, no limbs, gold
heart tag and glow only. Lemon Zest appears on the CTA chip and nowhere else.

## Copy changes

Edit `campaign.json`, then re-run `render.mjs` → `schedule.mjs` → `verify.mjs`.
The stills, the reels, the CSV, the captions file and the contact sheet all
derive from that one file, so they cannot drift apart.
