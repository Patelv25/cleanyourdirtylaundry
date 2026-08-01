// Gate for the campaign, mirroring the rails in AGENTS.md.
//   node verify.mjs
// 1. FACTS  — scans every line of campaign copy for forbidden claims.
// 2. PALETTE— samples every rendered frame and flags pixels whose hue sits
//             outside the navy/powder/sky band and the lemon/heart-gold band.
// Exits non-zero on any failure.

import { chromium } from 'playwright';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = resolve(ROOT, 'out');
const camp = JSON.parse(readFileSync(resolve(ROOT, 'campaign.json'), 'utf8'));

let fails = 0;
const fail = m => { console.error(`  FAIL  ${m}`); fails++; };
const ok = m => console.log(`  ok    ${m}`);

// ── 1. facts ──────────────────────────────────────────────────────────
console.log('\nFACTS');
const FORBIDDEN = [
  [/\$49/i, '"$49" first-month hook (undecided — rail #1)'],
  [/wavemax/i, 'names the facility (rail #1: "a commercial laundromat on North Raleigh Boulevard")'],
  [/\bwolf ?pack\b|\bwolves\b/i, 'wolf imagery/marks (rail #3)'],
  [/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/, 'a phone number (rail #1: none exists)'],
  [/!/, 'an exclamation mark (rail #6: deadpan voice)'],
  [/revolutionary|game[- ]chang|amazing|incredible|best[- ]in[- ]class/i, 'hype language (rail #6)'],
  [/\b\d+(\.\d)?\s*stars?\b|\b\d+\s*(reviews|customers|students served)\b/i, 'an invented stat or review (rail #1)'],
];
// price/cap must never appear as anything other than the locked values
const PRICE = /\$(\d+)\s*\/\s*(mo|month)/gi;
const CAP = /(\d+)\s*lb/gi;

const copyOf = p => [
  p.caption, p.alt, p.first_comment || '',
  ...p.slides.flatMap(s => [s.kicker, s.sub || '', ...s.hook]),
  ...(p.video ? p.video.beats.flatMap(b => [...b.lines, b.kicker || '']) : []),
].join('\n');

for (const p of camp.posts) {
  const text = copyOf(p) + '\n' + (camp.receipts_bar[p.id] || '');
  for (const [re, why] of FORBIDDEN) {
    if (re.test(text)) fail(`${p.id} contains ${why}`);
  }
  for (const m of text.matchAll(PRICE)) {
    if (m[1] !== '100') fail(`${p.id} quotes $${m[1]}/mo — locked price is $100/mo`);
  }
  for (const m of text.matchAll(CAP)) {
    if (m[1] !== '20') fail(`${p.id} quotes ${m[1]} lb — locked cap is 20 lb`);
  }
  if (/sheets|linens/i.test(text) && /(sheets|linens)[^.]*\$\d/i.test(text)) {
    fail(`${p.id} puts a number on sheets/linens — they are "priced at signup"`);
  }
}
if (!fails) ok(`${camp.posts.length} posts clear on locked facts and voice`);

// ── 2. palette ────────────────────────────────────────────────────────
console.log('\nPALETTE');
const dirs = existsSync(OUT) ? readdirSync(OUT) : [];
const frames = dirs.flatMap(d =>
  readdirSync(resolve(OUT, d)).filter(f => f.endsWith('.jpg')).map(f => resolve(OUT, d, f)));

if (!frames.length) {
  fail('no rendered frames found — run `node render.mjs` first');
} else {
  // file:// images must be same-origin for getImageData not to taint the canvas
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(HERE, 'templates/creative.html')).href);

  const worst = [];
  for (const f of frames) {
    const pct = await page.evaluate(async src => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const S = 220;
      const c = document.createElement('canvas');
      c.width = S; c.height = Math.round(S * img.height / img.width);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let bad = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, gr = d[i + 1] / 255, b = d[i + 2] / 255;
        const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b), dl = mx - mn;
        const sat = mx === 0 ? 0 : dl / mx;
        n++;
        if (sat < 0.14) continue;                       // neutral / near-grey
        let h = 0;
        if (dl !== 0) {
          if (mx === r) h = 60 * (((gr - b) / dl) % 6);
          else if (mx === gr) h = 60 * ((b - r) / dl + 2);
          else h = 60 * ((r - gr) / dl + 4);
        }
        if (h < 0) h += 360;
        const blue = h >= 185 && h <= 240;              // navy / powder / sky
        const gold = h >= 34 && h <= 58;                // lemon CTA + heart tag
        if (!blue && !gold) bad++;
      }
      return (bad / n) * 100;
    }, pathToFileURL(f).href);
    worst.push([pct, f]);
  }
  await browser.close();

  worst.sort((a, b) => b[0] - a[0]);
  const LIMIT = 0.5;   // % of pixels allowed off-band (JPEG + antialias fringe)
  for (const [pct, f] of worst) {
    if (pct > LIMIT) fail(`${f.split('/').pop()} — ${pct.toFixed(2)}% off-palette pixels`);
  }
  if (worst[0][0] <= LIMIT) {
    ok(`${frames.length} frames within palette (worst: ${worst[0][1].split('/').pop()} at ${worst[0][0].toFixed(2)}%)`);
  }
}

console.log(fails ? `\n${fails} failure(s)\n` : '\nall gates passed\n');
process.exit(fails ? 1 : 0);
