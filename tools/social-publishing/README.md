# Social publishing — content guard + Facebook video publisher

> **Staged here, belongs elsewhere.** This tooling's natural home is
> `jarvis-mission-control/skills/shared/posting/`. It landed in this repo only
> because push access to mission-control wasn't available at the time. Migrate it
> when that opens up — nothing here is coupled to the CYDL site, and no site
> files, `CNAME`, `founders-count.json`, the waitlist form, `robots.txt` or
> `sitemap.xml` were touched.

## What broke

Two separate failures, one visible symptom ("the videos aren't posting").

### 1. Google Business Profile — posting suspended (the actual blocker)

On **2026-07-30** Google disabled posting on the **Hamper'd Laundry Services**
profile:

> *"your post violates Google's content policy"*
> *"Google has turned off posting for this Business Profile to prevent edits that violate Google's policies."*
> Routing ID: **DPNB**

The post it quoted:

> *"Easiest way to start with Hamper'd: just call us at (919) 283-3010. We'll set up your weekly pick..."*

Google's posts content policy disallows phone numbers in post **body** text
("phone stuffing"); their detector flags any digit run of phone-number length
regardless of punctuation. The supported patterns are the **Call now** CTA
button, or the number rendered inside the image.

Because the shutoff is at *profile* level, everything queued behind it fails
regardless of content — which is why *all* the videos failed rather than some.

Two compounding problems in that one post:

- a phone number in the body at all, and
- **(919) 283-3010**, which matches nothing in any repo. `ground-truth.md` locks
  Hamper'd's number as **(919) 301-8054**.

That is the third instance of this failure class on record: **ERR-008** (wrong
phone in a CYDL post) and **ERR-010** (deprecated number in 9 sent emails).
**RULE-010** already concluded advisory checklists don't stop it.

### 2. Facebook — no video path ever existed

`facebook-post.skill.md` implements `/photos` and `/feed` only. There is no
`/videos` and no `/video_reels`. A video handed to it could never publish. It has
also been flagged `🚫 PAUSED — DO NOT POST` since 2026-03-17 on a broken token
(Graph error **190**), which was never confirmed resolved.

## What's here

### `content_policy_validator.py`

Blocking pre-publish check. **Exit 0 = safe, exit 1 = do not publish.** Per
RULE-010 it refuses rather than warns.

```bash
python3 content_policy_validator.py --brand hamperd \
  --surface google_business_profile --text "call us at (919) 283-3010"
# BLOCKED — 1 violation(s)
#   [GBP-PHONE-IN-BODY] google_business_profile forbids phone numbers in post body...
```

Catches:

| Code | Trigger |
|---|---|
| `GBP-PHONE-IN-BODY` | any phone number in Google Business Profile body copy |
| `PHONE-MISMATCH` | a number that isn't the brand's approved one |
| `PHONE-UNRESOLVED` / `PHONE-NONE_EXISTS` | a number where ground truth defines none |
| `CROSS-BRAND` | Hamper'd contact details in CYDL copy, or the reverse |

Phone matching is structural (`(919) 301-8054`, `919.301.8054`, `9193018054`,
`283-3010`) rather than "any run of ~10 digits", so launch dates and prices don't
trip it — `$100/mo`, `Aug 22 2026`, `2026-08-22 10:00` all pass. Tests cover
this, including a regression test built from the exact post Google quoted.

```bash
python3 -m unittest test_content_policy_validator -v   # 11 tests
```

### `brand-facts.json`

Contact facts the validator checks against, from `ground-truth.md` and this
repo's `AGENTS.md` rail #1.

**`hamperd.phone` is deliberately `null`.** Until the (919) 301-8054 vs
(919) 283-3010 question is settled, the validator blocks *any* Hamper'd copy
carrying a phone number. That's intentional — the unresolved fact fails loudly
instead of silently shipping the wrong number a fourth time. Set it once Vee
confirms.

### `facebook_video_publish.js`

The missing publisher. Reels (three-phase `start` → `upload` → `finish`) and feed
video, from a local file or a hosted URL.

```bash
node facebook_video_publish.js --page-id 104692988625872 \
  --file ./clip.mp4 --caption "..." --brand hamperd --type reel
```

Enforces the two rules that were already written down and not applied:

- **RULE-001** — `/debug_token` preflight. Verifies validity, expiry, and the
  `pages_manage_posts` / `pages_read_engagement` scopes before any write. Error
  190 is called out explicitly, since that's what paused the pipeline in March.
- **RULE-010** — runs the validator on the caption and refuses on non-zero exit.

It also polls `video_status` until `ready` rather than treating HTTP 200 as
success (**RULE-005** — silence is not success).

## What this does *not* fix

Three things need a human; no code can reach them:

1. **The Google suspension.** File the reinstatement appeal on the Business
   Profile quoting Routing ID **DPNB**. Nothing publishes there until it's
   granted.
2. **The phone number.** Confirm (919) 301-8054 or (919) 283-3010, then set
   `hamperd.phone` in `brand-facts.json`.
3. **The Page token.** If `/debug_token` reports 190, regenerate it in Meta
   Business Suite (System User → Generate token) and update the
   `facebook-hamperd-page-token` secret.

And one platform limit worth stating plainly: **the Graph API publishes to Pages
only.** Meta removed `publish_actions` in v3.0 (2018), so there is no supported
way to post to a personal profile timeline. If the goal is for a video to appear
on a personal Facebook, publish to the Page and share it from there.
