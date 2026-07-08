# CYDL v3 — "THE PILE vs THE BAG" Build Spec
## Concept A five-chapter scroll story · 2026-07-08 · Vee-greenlit (Pile = canon, Character 6)

READ FIRST: `../Characters/JAW-BREAKER-DIRECTION.md` (concept),
`../Characters/SIMULATION-READOUT.md` (revisions — receipts > cute),
`index.html` (the v2 base you are UPGRADING, not replacing).

## Non-negotiable rails
- Palette: Soft Navy `#1E2A38` (+existing --navy-deep/--navy-raise), Powder
  Rinse `#E6F0FA`, Skywash `#7FBFE9`. **Lemon Zest `#FFD24D` = CTAs + the
  home-base route node ONLY.** Use the existing CSS custom props.
- Facts: $100/mo flat · one 20 lb bag/week HARD cap · comforter $20 add-on ·
  sheets/linens = separate add-on "priced at signup" (NO number) · pickup Tue,
  back Thu · Packapalooza Sat Aug 22 · move-in Aug 14–16 · commercial
  laundromat on North Raleigh Blvd (never "WaveMax" on this site).
  **NO $49 first-month hook anywhere (undecided). NO phone number (undecided).
  NO invented reviews/testimonials/stats. NO wolf imagery (trademark).**
- Voice: deadpan, dry, receipts-first. The Pile is smug-sleepy, never evil,
  never unhinged. The Bag is an OBJECT — no legs, no face; gold heart tag +
  glow is its whole personality.
- Tech: single-file additions. CSS/SVG/vanilla JS only. No Rive, no libs, no
  external requests. Reuse v2 systems: `.reveal` + `[data-stagger]` (IO),
  `data-tear`, `data-parallax`, ticker, drum. Every new motion respects
  `prefers-reduced-motion` (static fallback) and works no-JS (content visible).
- A11y: WCAG AA contrast, decorative art `aria-hidden="true"`, meaningful art
  gets real alt/aria-label, focus states, no keyboard traps.
- Mobile-first: primary viewport 375px. Nothing scrolls horizontally.

## Chapter map (reorder of existing sections + new layers)
Order after build: nav → CH1 → ticker → CH2 → CH3 → CH4 → CH5 → parents
teaser → FAQ → footer.

- **CH1 — THE PILE GROWS** = hero `#top` + `#the-pile`. Add: chapter plate
  system (small mono "CH. 01 — THE PILE GROWS" kicker above each chapter, all
  five), Pile character mount growing across 3 scroll checkpoints (reuse
  .reveal steps; scroll-linked scale where cheap), kinetic-type stack in
  `#the-pile` ("ONE HOODIE." → "THE CHAIR IS GONE." style, display font,
  reveals in sequence), honest social-proof slot (chip row: "First named
  house review lands after move-in. We'd rather show a real one than write a
  fake one."). Group chat block stays.
- **CH2 — TUESDAY. THE BAG.** = `#how-it-works` + `#pricing` **moved up to
  directly follow how-it-works** (Evan's 60-second receipts bar). Add: Bag
  object hero moment (SVG, gold-heart glow) beside step 01; SMS promise line
  in step 01 copy: "We text you a reminder Monday night." + matching FAQ
  entry ("What if I forget the bag?" → Monday-night text promise, nothing
  more); pricing card gains chapter plate "CH. 02 — THE RECEIPTS".
- **CH3 — THE ROUTE** = `#the-route`. Upgrade van from time-animation to
  SCROLL-SCRUBBED: section-scroll progress drives van position along the main
  path (path.getPointAtLength), spur handled gracefully. Reduced-motion/no-JS:
  current draw-on/static state. Keep all labels/nodes/distances EXACTLY
  (Meredith stays "WEST RALEIGH · THE SPUR" — no invented miles).
- **CH4 — THURSDAY** = `#the-return` + `#your-sunday-back`. Add: fold-reveal
  beat (stack rises from open Bag SVG as section reveals), freed-Chair cameo
  chip, Bag glow return moment. Copy stays largely intact.
- **CH5 — THE TICKET** = `#waitlist` + founding block from pricing.
  **Founding-100 reframe (sim finding: waitlist-lead framing reads as
  discount-code pitch): CTAs become "Claim your spot" (nav + hero too);
  founding NUMBER is the post-signup perk** — copy pattern: "Sign up. You get
  a number. The first 100 numbers are founding numbers — locked pickup
  priority at launch and numbered founding gear later." Success box already
  says number-by-email; strengthen. Keep honest live counter. Deflated-Pile
  cameo (small, losing, still smug).
- **PARENTS**: in-page `#parents` section stays as teaser + gains link to new
  standalone `parents.html` ("The full parent page →") and
  `hello@cleanyourdirtylaundry.com`. New `parents.html` = self-contained
  proof-led page: flat-price receipts table, policies (20 lb cap, comforter
  $20, overweight = text-first no surprise charges, damage handling), honest
  reviews slot (empty state, no fakes), hello@ mailto, "written for the
  person paying" tone, link back to main site + waitlist. Same design
  system (copy the token block + minimal CSS you need — page must stand
  alone). NO phone number.
- **FOOTER** (both pages): add hello@cleanyourdirtylaundry.com under "Find us".

## Character mounts (contract with characters.svg.html)
Chapter builders place `<div class="charm charm--NAME" data-char="KEY"
aria-hidden="true"></div>` mounts; the character artist delivers
`v3-build/characters.svg.html` with one `<svg>` per KEY:
`pile-1` (small, one hoodie) · `pile-2` (mid, sock dangling) ·
`pile-3` (mountain, smug-sleepy face: heavy lids + tiny satisfied smile) ·
`pile-deflated` (CH5, small, one eye open) · `bag-hero` (cream bag, navy
drawstring, gold heart tag, soft glow aura) · `bag-open-stack` (open bag,
folded stack rising) · `chair-freed` (the chair, empty, triumphant).
Style: warm illustration matching `../Characters/boards/` PNGs — rounded
forms, muted gold ONLY inside the heart tag + glow (this is brand art, not a
CTA — keep the gold soft/desaturated vs Lemon Zest), navy linework on powder.
Faces on the PILE ONLY. Each SVG ≤ ~120 lines, viewBox'd, currentColor-aware
where sensible.

## Deliverable contract (each builder)
Write to `v3-build/<slug>/`: `fragment.html` (full replacement/new markup for
your sections, mounts included), `fragment.css` (namespaced additions only —
prefix `.ch1-`…`.ch5-`, `.charm`, `.pp-` for parents page; NEVER edit
existing selectors, override via new classes), `fragment.js` (optional,
self-contained IIFE, reduced-motion + no-IO guards, passive listeners),
`NOTES.md` (what changed vs v2, integration order, risks). parents-page
builder writes complete `parents.html` instead. Do NOT touch `index.html`
directly — the integrator splices.
