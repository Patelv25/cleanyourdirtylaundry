# QA-WATCH checklist (final gate before publish)

Run Higgsfield video_analysis on the assembled episode and evaluate against this
checklist. ALL must pass. On fail: identify the failing segment, regenerate it,
reassemble, re-QA. Max {{MAX_RETRIES}} loops, then stop and flag for Vee.

1. **Anchor identity**: same face as `anchor/reference/anchor-at-desk.png` in every
   anchor shot. No face morphing between segments.
2. **Set consistency**: Hamper'd logo visible behind desk; navy/sky palette; no
   off-brand colors dominating; set matches the master keyframe.
3. **Lip-sync**: mouth matches audio; no dead-mouth or ghost-speech moments.
4. **Audio**: one consistent voice throughout; levels even; no clipped words at cuts.
5. **Flow**: cuts land between sentences; B-roll matches the event being narrated
   (never shows the wrong event); no segment feels orphaned.
6. **Text**: every lower-third spelled correctly, ≤6 words, readable ≥2s, brand
   style. NO garbled AI text anywhere in frame (check backgrounds and signage!).
7. **Runtime**: 60–90s. Hook lands by 0:02.
8. **Format**: 9:16, clean first frame (usable as cover), no watermarks.
9. **Claims**: spot-check narration against the episode manifest — every event
   name/day/venue spoken matches a confirmed row.
10. **Virality sanity**: run virality_predictor; if hook strength is weak, that is
    a fail — punch up the first 3 seconds.

Record the full QA result (pass/fail per item + notes) in the episode manifest.
