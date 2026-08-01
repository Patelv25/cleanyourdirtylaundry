// Gate for any campaign in this repo, driven by <campaign>/brand.json.
//   node verify.mjs ../algorithm-knows
//   node verify.mjs ../hamperd-sunday-tax
//
// 1. FACTS   — forbidden claims, and locked prices/caps if the brand has them.
// 2. BRAND   — the other brand's name, the other brand's lane, foreign artwork,
//              and account targeting. Symmetric: each brand.json names what must
//              never appear in its own posts, so neither can bleed into the other.
// 3. PALETTE — opaque cutouts, and pixels outside the brand's own hue bands.
// Exits non-zero on any failure.

import { chromium } from 'playwright';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const campArg = process.argv.slice(2).find(a => !a.startsWith('--'));
const ROOT = resolve(HERE, campArg || '../algorithm-knows');
const REPO = resolve(HERE, '../..');
const OUT = resolve(ROOT, 'out');

const camp = JSON.parse(readFileSync(resolve(ROOT, 'campaign.json'), 'utf8'));
const brand = JSON.parse(readFileSync(resolve(ROOT, 'brand.json'), 'utf8'));

let fails = 0;
const fail = m => { console.error(`  FAIL  ${m}`); fails++; };
const ok = m => console.log(`  ok    ${m}`);

console.log(`\n${camp.campaign}  ·  brand: ${brand.name} (${brand.status})`);
if (brand.status !== 'final') {
  console.log('  note  placeholder identity — frames carry a DRAFT band and must not be published');
}

const copyOf = p => [
  p.caption, p.alt, p.first_comment || '',
  ...p.slides.flatMap(s => [s.kicker, s.sub || '', ...s.hook]),
  ...(p.video ? p.video.beats.flatMap(b => [...b.lines, b.kicker || '']) : []),
].join('\n');

// ── 1. facts ──────────────────────────────────────────────────────────
console.log('\nFACTS');
const FORBIDDEN = [
  [/\$49/i, '"$49" first-month hook (undecided — rail #1)'],
  [/wavemax/i, 'names the facility (rail #1)'],
  [/\bwolf ?pack\b|\bwolves\b/i, 'wolf imagery/marks (rail #3)'],
  [/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/, 'a phone number (rail #1: none exists)'],
  [/!/, 'an exclamation mark (deadpan voice)'],
  [/revolutionary|game[- ]chang|amazing|incredible|best[- ]in[- ]class/i, 'hype language'],
  [/\b\d+(\.\d)?\s*stars?\b|\b\d+\s*(reviews|customers|students served)\b/i, 'an invented stat or review'],
];
for (const p of camp.posts) {
  const text = copyOf(p) + '\n' + (camp.receipts_bar[p.id] || '');
  for (const [re, why] of FORBIDDEN) if (re.test(text)) fail(`${p.id} contains ${why}`);

  if (camp.locked_facts) {           // only brands that have a locked price list
    for (const m of text.matchAll(/\$(\d+)\s*\/\s*(mo|month)/gi)) {
      if (m[1] !== '100') fail(`${p.id} quotes $${m[1]}/mo — locked price is $100/mo`);
    }
    for (const m of text.matchAll(/(\d+)\s*lb/gi)) {
      if (m[1] !== '20') fail(`${p.id} quotes ${m[1]} lb — locked cap is 20 lb`);
    }
    if (/(sheets|linens)[^.]*\$\d/i.test(text)) {
      fail(`${p.id} puts a number on sheets/linens — they are "priced at signup"`);
    }
  }
}
if (!fails) ok(`${camp.posts.length} posts clear on forbidden claims and voice`);

// unresolved tokens must never survive into a finalised brand
const beforeTokens = fails;
if (brand.status === 'final') {
  for (const p of camp.posts) {
    const t = copyOf(p).match(/\{\{[A-Z_]+\}\}/g);
    if (t) fail(`${p.id} still has unresolved tokens: ${[...new Set(t)].join(', ')}`);
  }
  if (fails === beforeTokens) ok('no unresolved {{TOKENS}} left in copy');
} else {
  const n = camp.posts.filter(p => /\{\{[A-Z_]+\}\}/.test(copyOf(p))).length;
  ok(`${n} posts still carry {{TOKENS}} — expected while the brand kit is pending`);
}

// ── 2. brand ──────────────────────────────────────────────────────────
console.log('\nBRAND');
{
  const before = fails;
  const other = new RegExp(brand.forbidden.other_brand, 'i');
  const offLane = new RegExp(brand.forbidden.off_lane, 'i');
  for (const p of camp.posts) {
    const text = copyOf(p);
    if (other.test(text)) {
      fail(`${p.id} mentions ${brand.forbidden.other_brand_label} — this is the ${brand.name} campaign`);
    }
    if (offLane.test(text)) fail(`${p.id} is pitched at ${brand.forbidden.off_lane_label}`);
  }

  // artwork must come from this brand's own directory
  const artDir = resolve(REPO, brand.art.dir);
  const legal = existsSync(artDir)
    ? new Set(readdirSync(artDir)
        .filter(f => f.startsWith(brand.art.prefix))
        .map(f => f.replace(/\.(webp|png|jpg|jpeg)$/, '')))
    : new Set();
  for (const p of camp.posts) {
    for (const key of [p.art, ...p.slides.map(s => s.art)].filter(Boolean)) {
      if (!legal.has(key)) {
        fail(`${p.id} uses "${key}" — not in ${brand.name}'s own art set (${brand.art.dir})`);
      }
    }
  }

  // account targeting, checked against the live site markup where we have it
  if (brand.accounts.verify_against) {
    const site = readFileSync(resolve(REPO, brand.accounts.verify_against), 'utf8');
    for (const url of [brand.accounts.instagram_url, brand.accounts.facebook_url]) {
      if (!site.includes(url)) fail(`account ${url} is not in ${brand.accounts.verify_against}`);
    }
  } else if (brand.status === 'final') {
    fail('brand is marked final but its accounts have no source to verify against');
  } else {
    ok('accounts still TODO — queue stays marked DRAFT, not publishable');
  }
  if (fails === before) {
    ok(`${brand.name} only — no ${brand.forbidden.other_brand_label} bleed, artwork in-set`);
  }
}

// ── 3. palette ────────────────────────────────────────────────────────
console.log('\nPALETTE');
const dirs = existsSync(OUT) ? readdirSync(OUT) : [];
const frames = dirs.flatMap(d =>
  readdirSync(resolve(OUT, d)).filter(f => f.endsWith('.jpg')).map(f => resolve(OUT, d, f)));

if (!frames.length) {
  fail('no rendered frames found — run render.mjs first');
} else {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(HERE, 'templates/creative.html')).href);

  // allowed hues come from the brand's own palette rather than a hardcoded band
  const hueOf = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < 0.06) return null;
    const h = mx === r ? 60 * (((g - b) / d) % 6)
            : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return h < 0 ? h + 360 : h;
  };
  const bands = Object.entries(brand.palette)
    .filter(([k, v]) => !k.startsWith('_') && /^#[0-9a-f]{6}$/i.test(v))
    .map(([, v]) => hueOf(v)).filter(h => h !== null)
    .map(h => [h - 22, h + 22]);

  const usedArt = [...new Set(camp.posts.flatMap(p =>
    [p.art, ...p.slides.map(s => s.art)].filter(Boolean)))];
  for (const key of usedArt) {
    const file = resolve(REPO, brand.art.dir, key + '.webp');
    if (!existsSync(file)) continue;
    const opaque = await page.evaluate(async src => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const at = (x, y) => g.getImageData(x, y, 1, 1).data[3];
      return [at(1, 1), at(img.width - 2, 1), at(1, img.height - 2),
              at(img.width - 2, img.height - 2)].every(a => a > 250);
    }, pathToFileURL(file).href);
    if (opaque) fail(`${key}.webp has an opaque background — it renders as a box`);
  }
  if (usedArt.length) ok(`${usedArt.length} cutouts have transparent mattes`);

  const worst = [];
  for (const f of frames) {
    const pct = await page.evaluate(async ([src, bands, draft]) => {
      const img = new Image(); img.src = src; await img.decode();
      const S = 220;
      const c = document.createElement('canvas');
      c.width = S; c.height = Math.round(S * img.height / img.width);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, c.width, c.height);
      // skip the draft band across the top — it is deliberately off-palette.
      // 7.5% clears it on the squarest surface (1080x1080) with margin for
      // JPEG ringing under the stripe edge.
      const y0 = draft ? Math.round(c.height * 0.075) : 0;
      const d = g.getImageData(0, y0, c.width, c.height - y0).data;
      let bad = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, gr = d[i + 1] / 255, b = d[i + 2] / 255;
        const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b), dl = mx - mn;
        n++;
        if (mx === 0 || dl / mx < 0.14) continue;
        let h = mx === r ? 60 * (((gr - b) / dl) % 6)
              : mx === gr ? 60 * ((b - r) / dl + 2) : 60 * ((r - gr) / dl + 4);
        if (h < 0) h += 360;
        if (!bands.some(([lo, hi]) => h >= lo && h <= hi)) bad++;
      }
      return (bad / n) * 100;
    }, [pathToFileURL(f).href, bands, brand.status !== 'final']);
    worst.push([pct, f]);
  }
  await browser.close();

  worst.sort((a, b) => b[0] - a[0]);
  const LIMIT = 0.5;
  for (const [pct, f] of worst) {
    if (pct > LIMIT) fail(`${f.split('/').pop()} — ${pct.toFixed(2)}% off-palette pixels`);
  }
  if (worst[0][0] <= LIMIT) {
    ok(`${frames.length} frames within palette (worst ${worst[0][0].toFixed(2)}%)`);
  }
}

console.log(fails ? `\n${fails} failure(s)\n` : '\nall gates passed\n');
process.exit(fails ? 1 : 0);
