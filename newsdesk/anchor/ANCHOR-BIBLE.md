# ANCHOR BIBLE — Hamper'd News Desk

STATUS: **LOCKED 2026-08-02** (anchor picked by Vee from 4 candidates: option D).
Changes only with Vee's explicit written sign-off.

## Identity (LOCKED)

- Anchor: South Asian American man, early 30s, short black hair, neat short beard,
  warm polished smile. On-air name: **Dev** (proposed — Vee may rename before ep-002).
- Face: master keyframe = Higgsfield image job `34203960-56b1-4f1e-b200-7a9fe495109c` (v2, fixed proportions; v1 was 497e6f21)
  (this exact person, every episode; always pass as start_image / identity reference)
  URL: https://d8j0ntlcm91z4.cloudfront.net/user_3BiQBfnQpWhNeBZQY2nVohh2sug/hf_20260802_195422_497e6f21-a1aa-4ed5-b718-ea376eac18e6.png
- Wardrobe: tailored deep-navy blazer (#1a3a6b) over plain white tee, no other logos.
  Same outfit every episode — it's a uniform.
- Voice: Higgsfield preset **Brooks** — voice_id `c2acff45-84b2-4974-892d-89fa2d4e5598`,
  voice_type `preset`, engine seed_audio. Same voice every episode.
  (Pending Vee's ear-check on ep-001 — swap allowed once, then locked.)

## The set (LOCKED)

Master empty-set plate: Higgsfield image job `b0bef186-0e05-4f1a-9434-3596185ac439`
URL: https://d8j0ntlcm91z4.cloudfront.net/user_3BiQBfnQpWhNeBZQY2nVohh2sug/hf_20260802_195224_b0bef186-0e05-4f1a-9434-3596185ac439.png

Description (for regeneration if ever needed): bright laundromat converted to a news
studio — glossy navy anchor desk with Hamper'd logo front panel, powder-blue wall with
Hamper'd logo + sky-blue neon "HAMPER'D NEWS DESK", row of white front-load washers
with warm golden bokeh, folded towels shelf. Palette strictly navy #1a3a6b / sky
#29abe2 / ice #e8f4fd / warm white. Apple Store meets local morning show.
NO NC State marks, NO wolf imagery, no third-party brands.

Logo source media (Higgsfield): `983c48ed-b59d-425f-9266-bfee54ac7f0e`
(imported from https://pub-9f93ea10f72c417d846284734145e8d5.r2.dev/hamperd-logo-transparent.png)

## Production recipe (LOCKED, ep-001 baseline)

- Anchor speaking clips: model `wan2_7`, medias = [start_image: master keyframe,
  audio_references: TTS clip], aspect 9:16, 1080p.
- TTS: model `seed_audio`, voice Brooks (above). One clip per script segment.
- B-roll: 5s silent clips, 9:16, no on-screen text/signage in B-roll (garbled-text risk).
- Assembly: Higgsfield sandbox_exec (ffmpeg): concat, VO overlay on B-roll, navy
  lower-thirds (Montserrat bold, white text, sky accent bar, bottom-left, ≥2s),
  end card = logo + hamperd.com + tagline.

## Locked lines

- Intro: "From the Hamper'd News Desk in Raleigh…"
- Outro: "Go live it up, Raleigh — the laundry's on us. Hamperd dot com."
- End-card tagline: "Pickup • Wash • Deliver • Repeat"

## Asset registry

| Asset | ID / URL |
|---|---|
| Master keyframe (anchor at desk) | job `497e6f21-a1aa-4ed5-b718-ea376eac18e6` |
| Empty set plate | job `b0bef186-0e05-4f1a-9434-3596185ac439` |
| Logo media (Higgsfield) | media `983c48ed-b59d-425f-9266-bfee54ac7f0e` |
| Voice | Brooks preset `c2acff45-84b2-4974-892d-89fa2d4e5598` |
| Unused candidates (archive) | A `35ad6b73-4806-4bfe-936d-43d983aaa4c4`, B `1868b408-2a02-4197-85af-b6436b1dcef9`, C `57adb1c2-4507-48b4-a08c-cc6d4f2f4dfb` |
