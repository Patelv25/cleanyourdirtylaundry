# Hamper'd — what I need before this renders

`campaign.json` holds ten posts of finished copy for **THE SUNDAY TAX**. It is
**not rendered and not queued**, because I do not have Hamper'd's brand and I am
not going to guess it.

## Why it stopped here

The CYDL campaign renders because this repo *is* CYDL: its palette, fonts, logo
and locked facts are all in `AGENTS.md`, `V3-SPEC.md` and `assets/`. For
Hamper'd I have none of that. What I tried:

| Source | Result |
|---|---|
| This repo | Only a footer cross-link to `hamperd.com`. No assets. |
| `list_repos` | No Hamper'd repository available to this session. |
| Google Drive | No files matching Hamper'd or a brand kit. |
| `hamperd.com` (+ `/pickup-and-delivery/`) | **HTTP 403** — the site blocks this session. |
| Web search | Positioning only. No pricing, no colours, no accounts. |

Using CYDL's navy/powder, Archivo Black, the heart-tag lockup or the Pile-and-Bag
characters on a Hamper'd post would be exactly the brand mix-up you flagged, so
the copy uses `{{TOKENS}}` wherever a real fact belongs.

## The five things that unblock it

1. **Pricing.** The flat monthly rate, and plan names if there is more than one.
   Their own copy says "one flat monthly rate" but never shows a number.
   → fills `{{PRICE}}`, `{{PLANS}}`
2. **Brand kit.** Hex colours, fonts, and the logo as SVG or PNG. Drop them in
   `campaigns/hamperd-sunday-tax/brand/` and I will wire them into the renderer.
3. **Accounts.** The Hamper'd Instagram handle and Facebook page URL, so the
   queue is stamped the way CYDL's is and cannot be posted to the wrong page.
4. **Service detail.** Exact service-area wording, the residential pickup/delivery
   day pattern, and how commercial is priced and scheduled.
   → fills `{{AREA}}`, `{{PICKUP}}`, `{{COMMERCIAL_TERMS}}`
5. **Photos.** See below.

## About the photos

You asked for photos rather than illustration, and for Hamper'd that is the right
call — real homes and real linens, not characters. Two problems:

- **There is no Hamper'd character set**, so there is no illustrated fallback the
  way CYDL has the Pile and the Bag. Photography is the only option.
- **I cannot deliver AI-generated photos into this repo.** I generated twelve
  plates for CYDL earlier and could not retrieve a single one — this session's
  egress policy blocks the image CDN. Anything I generate now would land in your
  Higgsfield gallery and stop there.

Every post in `campaign.json` carries a `photo_brief` written to be shot or
generated. Best options, in order:

1. **Real photos of actual Hamper'd work** — customer homes (with permission),
   the vans, the folded stacks, a real Raleigh salon's towels. Strongest for a
   family-run brand, and it is the one thing competitors cannot copy.
2. **You generate from the briefs** in Higgsfield/Nano Banana and drop the files
   into `brand/photos/`. I will composite, type-set and render them.
3. **Stock**, if speed matters more than authenticity.

## Two things to confirm

- **Voice.** I wrote Hamper'd warmer than CYDL — family-run and direct rather
  than deadpan and clever, because that is how their own site reads. If Hamper'd
  should share CYDL's deadpan instead, say so and I will rewrite before render.
- **The cross-brand line.** CYDL's footer already points household customers at
  Hamper'd. Worth pointing Hamper'd at CYDL for the "my kid is at NC State"
  case — but that is a positioning call, so I left it out.

## Then

Once 1-4 land, this renders and queues with the same pipeline and the same three
gates as CYDL — the brand gate simply runs in reverse, failing on any CYDL asset,
colour or price appearing in a Hamper'd post.
