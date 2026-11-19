/* DRM false memory demo: lists, test, scoring and words shared by the participant page and the results screen.
   The words are mirrored in google-apps-script/Code.gs. If you change them here, change them there too. */
(function (root) {
'use strict';

/* ---------- settings from config.js ---------- */
const CFG = Object.assign({ collectUrl:'', participantUrl:'', title:'', lists:['sleep', 'cold'], msPerWord:1500, distractorSec:20 }, root.DRM_CONFIG || {});

// The three lists with the highest false recognition in the published norms (Stadler, Roediger & McDermott, 1999,
// Table 2A). Words in the order they are shown, strongest associate first, as in the original lists.
const ALL_LISTS = [
  { lure:'sleep',  words:['bed', 'rest', 'awake', 'tired', 'dream', 'wake', 'snooze', 'blanket', 'doze', 'slumber', 'snore', 'nap', 'peace', 'yawn', 'drowsy'] },
  { lure:'window', words:['door', 'glass', 'pane', 'shade', 'ledge', 'sill', 'house', 'open', 'curtain', 'frame', 'view', 'breeze', 'sash', 'screen', 'shutter'] },
  { lure:'cold',   words:['hot', 'snow', 'warm', 'winter', 'ice', 'wet', 'frigid', 'chilly', 'heat', 'weather', 'freeze', 'air', 'shiver', 'arctic', 'frost'] },
];
// Lists nobody studies. Their critical word and their 1st and 8th words are the new items on the test.
const CONTROL = [
  { lure:'doctor', words:['nurse', 'physician'] },
  { lure:'sweet',  words:['sour', 'nice'] },
  { lure:'needle', words:['thread', 'thimble'] },
];
const picked = (Array.isArray(CFG.lists) ? CFG.lists : [CFG.lists]).map(String).filter(k => ALL_LISTS.some(l => l.lure === k));
const LISTS = (picked.length ? [...new Set(picked)] : ['sleep', 'cold']).map(k => ALL_LISTS.find(l => l.lure === k));
const K = LISTS.length;

// The recognition test, as in Roediger & McDermott (1995, Experiment 2):
//   studied   - list positions 1, 8 and 10 of each studied list
//   lure      - the critical word of each studied list (never shown)
//   control   - the critical word of one unstudied list per studied list
//   unrelated - positions 1 and 8 of those unstudied lists
const TEST = [].concat(
  ...LISTS.map(l => [0, 7, 9].map(i => ({ w:l.words[i], c:'studied', list:l.lure }))),
  LISTS.map(l => ({ w:l.lure, c:'lure', list:l.lure })),
  CONTROL.slice(0, K).map(c => ({ w:c.lure, c:'control' })),
  ...CONTROL.slice(0, K).map(c => c.words.map(w => ({ w, c:'unrelated' }))));
const CATS = ['studied', 'lure', 'control', 'unrelated'];
const COUNT = { studied:3 * K, lure:K, control:K, unrelated:2 * K };
const CONTROLS = CONTROL.slice(0, K);
const VERSION = 'drm-3';
const SIG = LISTS.map(l => l.lure).join(',');

// What the original studies found, to show next to the room's numbers.
// Roediger & McDermott (1995), Experiment 2, the condition with arithmetic (not recall) after each list.
const REF = { studied:0.65, lure:0.72, control:0.16, unrelated:0.11 };
// Stadler, Roediger & McDermott (1999), false recognition of each critical word (after a recall test).
const NORM = { sleep:0.80, window:0.84, cold:0.84 };
// about how long the whole thing takes, in seconds
// sums follow every list, as in Roediger & McDermott (1995, Experiment 2): list, sums, list, sums, ..., test
const SECONDS = Math.round(2.4 + K * (15 * CFG.msPerWord / 1000 + Math.max(5, CFG.distractorSec)) + (K - 1) * 1.8 + TEST.length * 2.2 + 15);

// answers: { word: 1 (said "I saw it") or 0 }
function score(answers) {
  const out = { studied:0, lure:0, control:0, unrelated:0 };
  for (const t of TEST) if (answers[t.w] === 1) out[t.c]++;
  return out;
}
function shuffle(a, rnd = Math.random) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
/* ---------- the pie: how many of the critical words each person said they saw ---------- */
// one violet ramp, brightest for "fooled by all of them", grey for "not fooled" (checked with the palette validator)
const RAMP = { 1:['#454B6B', '#B9A8FF'], 2:['#454B6B', '#7D6FD0', '#B9A8FF'], 3:['#454B6B', '#6E62B4', '#9586E8', '#B9A8FF'] };
const sliceColor = k => (RAMP[K] || RAMP[3])[k];
const SURFACE = '#111426';
const escX = t => String(t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
// counts[k] = people who said they saw k of the critical words. Slices run clockwise from the top, most fooled first,
// with a 2px gap in the surface colour between them.
function pieSVG(counts, opt = {}) {
  const size = opt.size || 240, c = size / 2, r = c - 2, total = counts.reduce((a, v) => a + v, 0);
  const p = [`<svg viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="${escX(opt.aria || '')}" xmlns="http://www.w3.org/2000/svg">`];
  if (!total) { p.push(`<circle cx="${c}" cy="${c}" r="${r}" fill="#2C3152"/></svg>`); return p.join(''); }
  const order = counts.map((v, k) => k).reverse().filter(k => counts[k] > 0);
  if (order.length === 1) { p.push(`<circle cx="${c}" cy="${c}" r="${r}" fill="${sliceColor(order[0])}" data-k="${order[0]}"/></svg>`); return p.join(''); }
  let a0 = -Math.PI / 2;
  for (const k of order) {
    const a1 = a0 + counts[k] / total * 2 * Math.PI, large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0), x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
    p.push(`<path data-k="${k}" d="M${c} ${c} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${sliceColor(k)}" stroke="${SURFACE}" stroke-width="2" stroke-linejoin="round"/>`);
    a0 = a1;
  }
  p.push('</svg>');
  return p.join('');
}

// "a", "a and b", "a, b and c" (and the Korean "a, b, c")
const joinWords = (ws, lang) => lang === 'ko' ? ws.join(', ') : ws.length < 3 ? ws.join(' and ') : ws.slice(0, -1).join(', ') + ' and ' + ws[ws.length - 1];

/* ---------- language: ?lang, then the one picked on this device, then config.js, then English ---------- */
const LANGS = ['en', 'ko'];
function pickLang() {
  let q = null, saved = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  try { saved = localStorage.getItem('drm:lang'); } catch (e) {}
  for (const v of [q, saved, CFG.lang]) if (LANGS.includes(v)) return v;
  return 'en';
}
const LANG = pickLang();
document.documentElement.lang = LANG;
function setLang(l) {
  try { localStorage.setItem('drm:lang', l); } catch (e) {}
  try { const u = new URL(location.href); u.searchParams.set('lang', l); location.replace(u.toString()); } catch (e) { location.reload(); }
}
const OTHER = LANG === 'en' ? { code:'ko', label:'한국어' } : { code:'en', label:'English' };
const pickText = v => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[LANG] || v.en || v.ko || '') : (v || '');

/* ---------- the collector: config check, ping, post, stats ---------- */
const CFG_PROBLEM = !root.DRM_CONFIG ? (root.DRM_CONFIG_ERROR === 'missing' ? 'missing' : 'syntax')
  : CFG.collectUrl && !/^https:\/\/script\.google(usercontent)?\.com\/.+\/exec(\?.*)?$/.test(CFG.collectUrl.trim()) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(CFG.collectUrl) ? 'shape' : '';
const timed = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
const withQuery = (u, q) => u + (u.includes('?') ? '&' : '?') + q;
async function getJSON(q, ms = 12000) {
  const r = await timed(fetch(withQuery(CFG.collectUrl.trim(), q), { cache:'no-store', redirect:'follow' }), ms);
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {}
  if (!j) throw new Error(/accounts\.google|ServiceLogin|<html/i.test(t) ? 'access' : 'notjson');
  return j;
}
async function post(body) {
  const r = await timed(fetch(CFG.collectUrl.trim(), { method:'POST', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body:JSON.stringify(body), redirect:'follow' }), 20000);
  const j = await r.json(); if (!j.ok) { const e = new Error('rejected'); e.said = j.error; throw e; }
  return j;
}

root.DRM = { LISTS, CONTROLS, K, TEST, CATS, COUNT, VERSION, SIG, REF, NORM, SECONDS, score, shuffle, joinWords, pieSVG, sliceColor,
  LANG, LANGS, OTHER, setLang, pickText, CFG, CFG_PROBLEM, getJSON, post };
})(window);
