# Hamper'd — five values away from finished

Ten posts of **THE SUNDAY TAX** are written, laid out and **rendered** — 26
frames in `out/`. Every one carries a red DRAFT band, because `brand.json` is
still on placeholder branding.

**Nothing here is publishable yet, and the pipeline enforces that**: while
`brand.json` has `"status": "placeholder"`, every frame gets the DRAFT band and
every row of `schedule/queue.csv` reads `DRAFT — DO NOT PUBLISH`.

## Why it is on placeholder

I could not read Hamper'd's brand from anywhere available to this session:

| Source | Result |
|---|---|
| This repo | Only a footer cross-link to `hamperd.com`. No assets. |
| `list_repos` | No Hamper'd repository available. |
| Google Drive | Nothing matching Hamper'd or a brand kit. |
| `hamperd.com`, `/pickup-and-delivery/`, `/about-us/pricing-subscriptions/` | **HTTP 403** on every attempt, direct and via a text proxy. Cloudflare blocks automated fetching. |
| Web search | Positioning only — "flat monthly rate" with no number, no colours, no accounts. |

Reaching for CYDL's navy/powder, Archivo Black, heart-tag lockup or Pile-and-Bag
characters would be exactly the brand mix-up you flagged, so the placeholder
palette is deliberately flat grey — it should look unfinished, because it is.

## The five values

Edit `brand.json`, set `"status": "final"`, re-run. That is the whole job.

1. **`palette`** — Hamper'd's real hex values.
2. **`fonts`** — the real display and body faces. (Anything on npm as
   `@fontsource/*` I can vendor; otherwise drop the files in `brand/fonts/`.)
3. **`logo`** — set `type` to `"file"` and put the logo at `brand/logo.svg`.
4. **`accounts`** — the Hamper'd Instagram handle and Facebook page URL. Until
   these are real the queue refuses to mark anything publishable.
5. **The `{{TOKENS}}`** in `campaign.json` — `{{PRICE}}`, `{{AREA}}`,
   `{{PICKUP}}`, `{{COMMERCIAL_TERMS}}`, `{{EMAIL}}`. They render literally on
   the drafts so you can see exactly where each one lands.

`verify.mjs` fails the build if `status` is `final` while any token or TODO
account is still unresolved, so it cannot be half-finished by accident.

## Photos

Hamper'd has no character set, so unlike CYDL there is no illustrated fallback —
photography is the only option, which is why the drafts render a dashed
**"photo goes here"** slot with that post's brief printed inside it. Each draft
doubles as its own shot list.

I could not generate them for you: the image CDN is blocked by this session's
egress policy (twelve CYDL plates were generated earlier and none could be
retrieved), and the Higgsfield connector has since dropped out entirely.

Best options, in order:

1. **Real photos of actual Hamper'd work** — homes with permission, the vans,
   folded stacks, a real Raleigh salon's towels. Strongest for a family-run
   brand, and the one thing competitors cannot copy.
2. **Generate from the briefs** yourself and drop the files into
   `brand/photos/`. I will composite, type-set and re-render.
3. **Stock**, if speed beats authenticity.

## Two calls to make

- **Voice.** I wrote Hamper'd warmer than CYDL — family-run and direct rather
  than deadpan and clever — because that is how their own copy reads. Say the
  word and I will rewrite to match CYDL's deadpan instead.
- **The commercial lane.** Three of the ten (H08 salons/gyms, H09 restaurants,
  H10 short-term-rental turnover) sell to businesses, not households. If
  commercial should be its own campaign on its own cadence, I will split it.
