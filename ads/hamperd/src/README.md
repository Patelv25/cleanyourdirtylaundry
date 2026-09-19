# Hamper'd reel — render source

The reel is a deterministic HTML animation screenshotted frame-by-frame
and encoded to H.264. No AI video generation, no external requests at
render time. All art is repo canon (`assets/world/`), labeled SHARED in
`ASSET-BRAND-LABELS.md`; all overlays use the locked palette tokens.

## Files
- `reel.html` — the 22s timeline. `window.seek(t)` positions every element
  for time `t`; beats and copy live in the BEATS array + markup.
- `render.py` — Playwright (Chromium) + ffmpeg pipeline.
  `python3 render.py` renders preview stills; `python3 render.py movie`
  renders `hamperd-reel.mp4` (660 frames, ~5 min).
- `fonts/` — Archivo Black + Inter woff2 (Google Fonts, OFL license).

## Requirements
- Chromium + ffmpeg with libx264 (in the CCR sandbox:
  `/opt/pw-browsers/chromium` and the `imageio-ffmpeg` binary; adjust the
  two paths at the top of `render.py` elsewhere).
- `pip install playwright imageio-ffmpeg`
- The two brand video loops are consumed as 30fps JPEG sequences in
  `frames/hero/` and `frames/porch/` (not committed — ~30 MB). Regenerate:
  `ffmpeg -i assets/world/hero-loop.mp4  -vf fps=30 -q:v 3 frames/hero/f_%04d.jpg`
  `ffmpeg -i assets/world/porch-loop.mp4 -vf fps=30 -q:v 3 frames/porch/f_%04d.jpg`
- `reel.html` references the repo's art by absolute path
  (`/home/user/cleanyourdirtylaundry/...`) — fix paths if the clone lives
  elsewhere.
