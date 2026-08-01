# campaigns/

Social campaigns, and the shared engine that renders them.

```
_engine/                 renderer, queue generator, gate — brand-agnostic
algorithm-knows/         CYDL · "THE ALGORITHM KNOWS"   · ready
hamperd-sunday-tax/      Hamper'd · "THE SUNDAY TAX"    · draft
```

## Two brands, one engine

| | CYDL | Hamper'd |
|---|---|---|
| Lane | Campus, student housing, NC State | Raleigh households + commercial |
| Site | cleanyourdirtylaundry.com | hamperd.com |
| Campaign | THE ALGORITHM KNOWS | THE SUNDAY TAX |
| Angle | Names the mess the algorithm spotted | Prices the hours laundry takes |
| Voice | Deadpan, receipts-first | Warm, family-run, direct |
| Status | Rendered, queued, gates pass | Rendered in draft, awaiting brand kit |

Each campaign directory holds its own `campaign.json` (the copy) and
`brand.json` (the identity — palette, fonts, logo, CTA, art set, accounts, and
what must never appear in its posts). The engine reads both, so rendering a
different brand takes no code change.

```bash
cd _engine && npm install
node render.mjs   ../algorithm-knows
node schedule.mjs ../algorithm-knows
node verify.mjs   ../algorithm-knows
```

## Keeping the brands apart

This is the failure mode worth engineering against: CYDL creative landing on a
Hamper'd account, or Hamper'd copy wearing CYDL's navy and heart tag. Each
`brand.json` declares a `forbidden` block naming the other brand and the other
brand's lane, and `verify.mjs` fails the build on:

- the other brand's name appearing in the copy
- copy pitched at the other brand's audience (dorms/campus vs household/commercial)
- artwork loaded from outside that brand's own art directory
- account targeting that no longer matches the source of truth
- a palette drifting outside the hues in that brand's own `brand.json`

Confirmed by planting faults in both directions — a CYDL cross-sell in a
Hamper'd caption, "perfect for your dorm" in Hamper'd copy, a CYDL post pointed
at Hamper'd's art directory, a warm-palette asset and a `$49` hook. All caught.

## Draft safety

A brand whose `brand.json` status is not `"final"` renders a red **DRAFT —
placeholder branding, not for publication** band across every frame, prints a
`DRAFT — DO NOT PUBLISH` banner at the top of its queue and run-sheet, and
stamps that status on every CSV row. Unresolved `{{TOKENS}}` render literally,
so a missing price is visible rather than silently blank — and the gate fails if
a brand is marked `final` while any token or placeholder account survives.

## Publishing

Neither campaign posts itself — there is no Meta connector in this environment.
`schedule/UPLOAD-QUEUE.md` is the run-sheet to work top to bottom;
`schedule/queue.csv` and `queue.json` are for bulk import or the Graph API.
