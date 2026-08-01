// Builds the publishing queue from campaign.json + whatever render.mjs produced.
//   node schedule.mjs
// Writes schedule/queue.csv, schedule/queue.json, schedule/captions.md,
// and a preview contact sheet at preview.html.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const campArg = process.argv.slice(2).find(a => !a.startsWith('--'));
const ROOT = resolve(HERE, campArg || '../algorithm-knows');
const OUT = resolve(ROOT, 'out');
const SCHED = resolve(ROOT, 'schedule');
mkdirSync(SCHED, { recursive: true });

const camp = JSON.parse(readFileSync(resolve(ROOT, 'campaign.json'), 'utf8'));
const brand = JSON.parse(readFileSync(resolve(ROOT, 'brand.json'), 'utf8'));
const DRAFT = brand.status !== 'final';
const acct = brand.accounts;
const slug = p => `${p.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// Which surface each format goes out on. IG Reels cross-post to FB Reels;
// carousels are IG-native and post to FB as an album.
const PLACEMENT = {
  single:   { ig: 'Feed (4:5)',       fb: 'Feed (1:1)' },
  carousel: { ig: 'Carousel (4:5)',   fb: 'Album (4:5)' },
  reel:     { ig: 'Reel (9:16)',      fb: 'Reel (9:16)' },
  story:    { ig: 'Story (9:16)',     fb: 'Story (9:16)' },
};

const tags = (p, i) => {
  const rot = camp.hashtags.rotate;
  const pick = [rot[(i * 3) % rot.length], rot[(i * 3 + 1) % rot.length], rot[(i * 3 + 2) % rot.length]];
  return [...camp.hashtags.core, ...pick].join(' ');
};

const fmtDate = iso => iso.slice(0, 10);
const fmtTime = iso => iso.slice(11, 16);
// day-of-week of the *local* calendar date, not the UTC instant
const dayName = iso =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(iso.slice(0, 10) + 'T12:00:00Z').getUTCDay()];

const rows = [], json = [], md = [];

md.push(`# ${camp.campaign} — publishing queue\n`);
md.push(`${camp.premise}\n`);
if (DRAFT) {
  md.push(`> ## ⚠ DRAFT — DO NOT PUBLISH`);
  md.push(`> ${brand.name}'s brand kit is not in this repo, so every frame renders with`);
  md.push(`> placeholder branding and a DRAFT band, and the copy still contains {{TOKENS}}.`);
  md.push(`> See BRAND-KIT-NEEDED.md.\n`);
}
md.push(`## Post these to ${brand.name} only\n`);
md.push(`- Instagram: **${acct.instagram}**`);
md.push(`- Facebook: **${acct.facebook_page}** — ${acct.facebook_url}\n`);
md.push(`> ${camp.not_this_brand}\n`);
md.push(`All times **${camp.timezone}**. Window: ${camp.window}.`);
md.push(`Assets: \`campaigns/${camp.slug}/out/<post>/\`\n`);
md.push(`> Every price, date and cap below is from the locked-facts list in`);
md.push(`> \`campaign.json\`. Do not edit copy without re-checking AGENTS.md rail #1.\n`);
md.push('---\n');

camp.posts.forEach((p, i) => {
  const dir = resolve(OUT, slug(p));
  const files = existsSync(dir) ? readdirSync(dir).sort() : [];
  const media = files.map(f => `out/${slug(p)}/${f}`);
  const place = PLACEMENT[p.format];
  const hashtags = tags(p, i);
  const fullCaption = `${p.caption}\n\n${hashtags}`;

  json.push({
    brand: brand.name,
    instagram_account: acct.instagram,
    facebook_page: acct.facebook_url,
    id: p.id, name: p.name, format: p.format,
    publish_at: p.schedule,
    instagram: place.ig, facebook: place.fb,
    media, caption: p.caption, hashtags,
    alt_text: p.alt, first_comment: p.first_comment || '',
  });

  rows.push([
    DRAFT ? 'DRAFT — DO NOT PUBLISH' : 'READY',
    brand.name, acct.instagram, acct.facebook_url,
    p.id, p.name, fmtDate(p.schedule), dayName(p.schedule), fmtTime(p.schedule),
    'America/New_York', p.format, place.ig, place.fb,
    media.join(' | '), fullCaption, p.first_comment || '', p.alt,
  ]);

  md.push(`## ${p.id} — ${p.name}`);
  md.push(`**${dayName(p.schedule)} ${fmtDate(p.schedule)} · ${fmtTime(p.schedule)} ET** · `
    + `IG ${place.ig} · FB ${place.fb}\n`);
  md.push('**Caption**\n');
  md.push('```');
  md.push(fullCaption);
  md.push('```\n');
  if (p.first_comment) md.push(`**First comment:** ${p.first_comment}\n`);
  md.push(`**Alt text:** ${p.alt}\n`);
  md.push(`**Files:** ${media.map(m => '`' + m.split('/').pop() + '`').join(', ')}\n`);
  md.push('---\n');
});

// ── upload queue: the chronological run-sheet you actually work through ──
const q = [`# UPLOAD QUEUE — ${camp.campaign}\n`];
if (DRAFT) {
  q.push(`> ## ⚠ DRAFT — DO NOT PUBLISH`);
  q.push(`> Placeholder branding, unresolved {{TOKENS}}, and no confirmed accounts.`);
  q.push(`> Fill brand.json, re-run render + verify, then work this list.\n`);
}
q.push(`**Brand: ${brand.name}.** Post to **${acct.instagram}** on Instagram and`);
q.push(`**${acct.facebook_page}** on Facebook (${acct.facebook_url}).`);
q.push(`Not ${brand.forbidden.other_brand_label} — that is a different brand with different accounts.\n`);
q.push(`Work top to bottom. All times **${camp.timezone}**. Tick as you schedule.\n`);
q.push(`---\n`);

camp.posts.forEach((p, i) => {
  const dir = resolve(OUT, slug(p));
  const files = existsSync(dir) ? readdirSync(dir).sort() : [];
  const place = PLACEMENT[p.format];
  const ig = files.filter(f => f.includes('4x5') || f.includes('9x16'));
  const fb = files.filter(f => f.includes('1x1') || f.includes('9x16'));

  q.push(`### ${i + 1}. ${p.id} — ${p.name}`);
  q.push(`- [ ] **${dayName(p.schedule)} ${fmtDate(p.schedule)}, ${fmtTime(p.schedule)} ET**`);
  q.push(`- [ ] Instagram · ${place.ig} · \`${(ig.length ? ig : files).join('`, `')}\``);
  q.push(`- [ ] Facebook · ${place.fb} · \`${(fb.length ? fb : files).join('`, `')}\``);
  q.push(`- [ ] Alt text set on every image`);
  if (p.first_comment) q.push(`- [ ] First comment posted`);
  q.push(`\n<details><summary>caption</summary>\n\n\`\`\`\n${p.caption}\n\n${tags(p, i)}\n\`\`\`\n`);
  if (p.first_comment) q.push(`First comment: \`${p.first_comment}\`\n`);
  q.push(`Alt: ${p.alt}\n</details>\n`);
});
writeFileSync(resolve(SCHED, 'UPLOAD-QUEUE.md'), q.join('\n'));

const csvCell = v => `"${String(v).replace(/"/g, '""')}"`;
const header = ['status', 'brand', 'instagram_account', 'facebook_page',
  'post_id', 'name', 'publish_date', 'day', 'publish_time', 'timezone',
  'format', 'instagram_placement', 'facebook_placement', 'media_files',
  'caption', 'first_comment', 'alt_text'];
const csv = [header.join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\n');

writeFileSync(resolve(SCHED, 'queue.csv'), csv + '\n');
writeFileSync(resolve(SCHED, 'queue.json'), JSON.stringify({
  campaign: camp.campaign, brand: camp.brand, accounts: acct,
  not_this_brand: camp.not_this_brand,
  timezone: camp.timezone, posts: json,
}, null, 2) + '\n');
writeFileSync(resolve(SCHED, 'captions.md'), md.join('\n'));

// ── contact sheet ─────────────────────────────────────────────────────
const cards = camp.posts.map((p, i) => {
  const dir = resolve(OUT, slug(p));
  const files = existsSync(dir) ? readdirSync(dir).sort() : [];
  const hero = files.find(f => f.endsWith('.mp4'))
    || files.find(f => f.includes('4x5')) || files[0];
  const isVid = hero && hero.endsWith('.mp4');
  const src = `out/${slug(p)}/${hero}`;
  return `<article>
  <div class="shot">${isVid
    ? `<video src="${src}" muted loop autoplay playsinline></video>`
    : `<img src="${src}" alt="">`}</div>
  <div class="meta">
    <span class="tag">${p.id} · ${p.format}</span>
    <h3>${p.name}</h3>
    <p class="when">${dayName(p.schedule)} ${fmtDate(p.schedule)} · ${fmtTime(p.schedule)} ET</p>
    <p class="cap">${p.caption.split('\n')[0]}</p>
    <p class="files">${files.length} file${files.length === 1 ? '' : 's'}</p>
  </div>
</article>`;
}).join('\n');

writeFileSync(resolve(ROOT, 'preview.html'), `<!doctype html>
<meta charset="utf-8"><title>${brand.name} — ${camp.campaign}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--navy:#1E2A38;--deep:#16202B;--powder:#E6F0FA;--sky:#7FBFE9;--lemon:#FFD24D}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--deep);color:var(--powder);
  font:16px/1.5 Inter,system-ui,sans-serif;padding:3rem 1.5rem 6rem}
header{max-width:76rem;margin:0 auto 3rem}
h1{font:800 clamp(1.8rem,5vw,2.8rem)/1.05 Archivo,system-ui,sans-serif;letter-spacing:-.02em}
header p{color:rgba(230,240,250,.66);max-width:44rem;margin-top:.75rem}
.grid{max-width:76rem;margin:0 auto;display:grid;gap:1.5rem;
  grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
article{background:#243447;border-radius:14px;overflow:hidden;
  border:1px solid rgba(127,191,233,.18)}
.shot{background:var(--deep);aspect-ratio:4/5;display:grid;place-items:center;overflow:hidden}
.shot img,.shot video{width:100%;height:100%;object-fit:contain}
.meta{padding:1rem 1.1rem 1.25rem}
.tag{font:500 11px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;
  color:var(--sky)}
h3{font:800 1.1rem/1.2 Archivo,system-ui,sans-serif;margin:.5rem 0 .25rem}
.when{font:500 12px/1.4 ui-monospace,monospace;color:var(--lemon);letter-spacing:.06em}
.cap{color:rgba(230,240,250,.62);font-size:.86rem;margin-top:.6rem}
.files{color:rgba(230,240,250,.4);font-size:.72rem;margin-top:.6rem;
  font-family:ui-monospace,monospace}
</style>
<header>
  <h1>${camp.campaign}</h1>
  <p>${camp.premise}</p>
  <p style="margin-top:.5rem;font-family:ui-monospace,monospace;font-size:.8rem;color:var(--sky)">
    ${camp.posts.length} posts · ${camp.window} · all times ${camp.timezone}</p>
</header>
<div class="grid">
${cards}
</div>
`);

console.log(`queue.csv, queue.json, captions.md → schedule/`);
console.log(`preview.html → campaigns/${camp.slug}/preview.html`);
