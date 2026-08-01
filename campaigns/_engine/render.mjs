// Creative renderer, shared by every campaign in this repo.
// Reads <campaign>/campaign.json for the copy and <campaign>/brand.json for
// the identity, so the same engine renders a different brand without a code
// change — and cannot silently mix two brands together.
//
//   node render.mjs ../algorithm-knows              # everything
//   node render.mjs ../algorithm-knows --stills     # skip video encoding
//   node render.mjs ../algorithm-knows P03 P10      # only these posts
//   node render.mjs ../hamperd-sunday-tax
//
// A brand whose brand.json status is not "final" renders with a DRAFT band
// across every frame.

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ffmpegStatic from 'ffmpeg-static';

const HERE = dirname(fileURLToPath(import.meta.url));
// campaign directory is the first non-flag argument, e.g. `node render.mjs ../algorithm-knows`
const campArg = process.argv.slice(2).find(a => !a.startsWith('--') && !/^P\d\d$/.test(a));
const ROOT = resolve(HERE, campArg || '../algorithm-knows');
const OUT = resolve(ROOT, 'out');
const TPL = pathToFileURL(resolve(HERE, 'templates/creative.html')).href;
// Playwright's bundled ffmpeg is a stripped VP8/webm-only build; Meta wants
// H.264/MP4, so we use the full static build from npm.
const FFMPEG = ffmpegStatic;
const FPS = 30;

const argv = process.argv.slice(2).filter(a => a !== campArg);
const stillsOnly = argv.includes('--stills');
const only = argv.filter(a => /^P\d\d$/.test(a));

const camp = JSON.parse(readFileSync(resolve(ROOT, 'campaign.json'), 'utf8'));
const brand = JSON.parse(readFileSync(resolve(ROOT, 'brand.json'), 'utf8'));
const REPO = resolve(HERE, '../..');
// art paths are resolved relative to the template, which lives in _engine/templates
const artPath = key => relative(resolve(HERE, 'templates'),
  resolve(REPO, brand.art.dir, key + (brand.art.prefix === 'blue-' ? '.webp' : '')));
const barFor = id => camp.receipts_bar[id] || camp.receipts_bar._default;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (m.type() === 'error') console.error('  page error:', m.text()); });
await page.goto(TPL);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(b => window.applyBrand(b), brand);
console.log(`brand: ${brand.name} (${brand.status})`);
if (brand.status !== 'final') {
  console.log('  ⚠ placeholder identity — every frame gets a DRAFT band');
}

const manifest = [];
let stills = 0, videos = 0;

for (const post of camp.posts) {
  if (only.length && !only.includes(post.id)) continue;
  const dir = resolve(OUT, `${post.id}-${post.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  mkdirSync(dir, { recursive: true });
  const files = [];

  // ── stills ──────────────────────────────────────────────────────────
  for (const spec of post.renders) {
    for (let i = 0; i < post.slides.length; i++) {
      const s = post.slides[i];
      const art = s.art || (post.slides.length === 1 ? post.art : null);
      const size = await page.evaluate(o => window.renderStill(o), {
        spec,
        theme: post.theme,
        layout: s.layout,
        kicker: s.kicker,
        hook: s.hook,
        accent_line: s.accent_line ?? -1,
        sub: s.sub,
        art: art ? artPath(art) : null,
        facts: barFor(post.id),
        chipText: post.cta || brand.cta,
        photoBrief: brand.status === 'final' ? null : (post.photo_brief || null),
      });
      await page.setViewportSize({ width: size.w, height: size.h });
      const n = post.slides.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
      const file = `${post.id}-${spec}${n}.jpg`;
      await page.locator('#frame').screenshot({
        path: resolve(dir, file), type: 'jpeg', quality: 92,
      });
      files.push(file); stills++;
      process.stdout.write(`  ${post.id} ${file}\n`);
    }
  }

  // ── video ───────────────────────────────────────────────────────────
  if (post.video && !stillsOnly) {
    const frames = resolve(HERE, '.frames');
    rmSync(frames, { recursive: true, force: true });
    mkdirSync(frames, { recursive: true });

    const size = await page.evaluate(o => window.setupVideo(o), {
      beats: post.video.beats,
      duration: post.video.duration,
      facts: barFor(post.id).replace(/\n/g, '   ·   '),
      chipText: brand.cta,
    });
    await page.setViewportSize({ width: size.w, height: size.h });

    const total = Math.round(post.video.duration * FPS);
    for (let f = 0; f < total; f++) {
      await page.evaluate(t => window.drawFrame(t), f / FPS);
      await page.locator('#frame').screenshot({
        path: resolve(frames, `f${String(f).padStart(5, '0')}.jpg`),
        type: 'jpeg', quality: 94,
      });
    }
    const file = `${post.id}-reel-9x16.mp4`;
    execFileSync(FFMPEG, [
      '-y', '-loglevel', 'error', '-framerate', String(FPS),
      '-i', resolve(frames, 'f%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      '-vf', 'scale=1080:1920',
      resolve(dir, file),
    ]);
    rmSync(frames, { recursive: true, force: true });
    files.push(file); videos++;
    process.stdout.write(`  ${post.id} ${file}  (${total} frames)\n`);
  }

  manifest.push({ id: post.id, name: post.name, format: post.format, dir, files });
}

await browser.close();
console.log(`\n${stills} stills, ${videos} videos → ${OUT}`);
export { manifest };
