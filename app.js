'use strict';
/* Scadenze Auto e Moto - PWA senza dipendenze. Dati salvati in localStorage. */

const KEY = 'scadenze-auto-v1';
const COLORS = [
  ['#6c5ce7', '#00b4d8', 'Oceano'], ['#f43f5e', '#fb923c', 'Tramonto'], ['#10b981', '#3b82f6', 'Foresta'],
  ['#ec4899', '#8b5cf6', 'Orchidea'], ['#f59e0b', '#ef4444', 'Fuoco'], ['#0ea5e9', '#6366f1', 'Notte']
];
const TYPES = {
  olio:          { label: 'Cambio olio e filtro',  short: 'Olio',          icon: '🛢️', km: 15000,  mo: 0, kmOnly: true },
  tagliando:     { label: 'Tagliando',             short: 'Tagliando',     icon: '🔧', km: 15000,  mo: 12 },
  cinghia:       { label: 'Cinghia distribuzione', short: 'Cinghia',       icon: '🔗', km: 120000, mo: 0, kmOnly: true },
  gomme:         { label: 'Cambio gomme',          short: 'Gomme',         icon: '🔄', km: 40000,  mo: 60 },
  filtroaria:    { label: 'Filtro aria',           short: 'Filtro aria',   icon: '🌬️', km: 30000,  mo: 24 },
  abitacolo:     { label: 'Filtro abitacolo',      short: 'F. abitacolo',  icon: '🍃', km: 15000,  mo: 12 },
  carburante:    { label: 'Filtro carburante',     short: 'F. carburante', icon: '⛽', km: 60000,  mo: 48 },
  revisione:     { label: 'Revisione',             short: 'Revisione',     icon: '✅', km: 0,      mo: 24 },
  bollo:         { label: 'Bollo',                 short: 'Bollo',         icon: '🧾', km: 0,      mo: 12 },
  assicurazione: { label: 'Assicurazione',         short: 'Assicurazione', icon: '🛡️', km: 0,      mo: 12 }
};
const GROUPS = [
  { id: 'doc', label: 'Documenti', types: ['bollo', 'assicurazione', 'revisione', 'tagliando'] },
  { id: 'mech', label: 'Meccanica', types: ['olio', 'cinghia', 'gomme', 'filtroaria', 'abitacolo', 'carburante'] }
];
const ORDER = GROUPS.flatMap(g => g.types);
/* voci non previste per tipo di veicolo, e voci nascoste dall'utente (v.hidden) */
const NOT_FOR = { moto: ['abitacolo'] };
const availFor = type => ORDER.filter(t => !(NOT_FOR[type] || []).includes(t));
const typesOf = v => availFor(v.type).filter(t => !(v.hidden || []).includes(t));
const groupsOf = (v, extra) => GROUPS.map(g => ({ id: g.id, label: g.label, types: g.types.filter(t => typesOf(v).includes(t) || t === extra) })).filter(g => g.types.length);
const histGroups = v => GROUPS.map(g => ({ id: g.id, label: g.label, types: g.types.filter(t => availFor(v.type).includes(t) || S.records.some(r => r.vid === v.id && r.type === t)) })).filter(g => g.types.length);
/* Valori standard proposti nelle ricorrenze (si puo sempre scrivere un valore a mano) */
const PRESETS = {
  olio:          { km: [5000, 10000, 15000, 20000, 30000] },
  tagliando:     { km: [10000, 15000, 20000, 30000], mo: [12, 24] },
  cinghia:       { km: [60000, 90000, 120000, 150000] },
  gomme:         { km: [20000, 30000, 40000, 50000, 60000], mo: [36, 48, 60] },
  filtroaria:    { km: [15000, 20000, 30000, 40000], mo: [12, 24, 36] },
  abitacolo:     { km: [10000, 15000, 20000, 30000], mo: [12, 24] },
  carburante:    { km: [30000, 60000, 90000], mo: [24, 36, 48, 60] },
  revisione:     { mo: [12, 24] },
  bollo:         { mo: [6, 12] },
  assicurazione: { mo: [6, 12] }
};
const REM_KM = [500, 1000, 2000, 3000], REM_DAYS = [7, 15, 30, 60];
const ICONS = {
  home: 'M4 11l8-7 8 7v9H4zM9 20v-6h6v6',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  hist: 'M12 7v5l3 2M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  set: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
  plus: 'M12 5v14M5 12h14',
  car: 'M3 16v-4l2-5h14l2 5v4M3 16h18M7 16v2M17 16v2M6 12h12',
  moto: 'M3 17a3 3 0 1 0 6 0a3 3 0 1 0-6 0M15 17a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 17h6l3-7h-4l-2-3H7',
  edit: 'M4 20h4L19 9l-4-4L4 16z',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  dl: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  ul: 'M12 16V5M7 9l5-5 5 5M5 20h14',
  bell: 'M6 17h12l-2-3v-4a4 4 0 0 0-8 0v4zM10 20h4',
  cam: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7'
};
const ico = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;

/* ---------- utilità ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const ymd = s => { const [a, b, c] = s.split('-').map(Number); return [a, b - 1, c]; };
const pdate = s => new Date(...ymd(s));
const fd = s => { const [a, b, c] = s.split('-'); return `${c}/${b}/${a}`; };
const fk = n => Math.round(n).toLocaleString('it-IT', { useGrouping: 'always' });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const num = x => { const n = parseInt(x, 10); return isNaN(n) ? null : n; };
const pos = x => { const n = num(x); return n && n > 0 ? n : null; };
function addMonths(s, n) {
  const d = pdate(s), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return iso(d);
}
function addDays(s, n) { const d = pdate(s); d.setDate(d.getDate() + n); return iso(d); }
const diffDays = (a, b) => Math.round((Date.UTC(...ymd(b)) - Date.UTC(...ymd(a))) / 864e5);
function fdays(n) { return n < 45 ? (n === 1 ? '1 giorno' : `${n} giorni`) : `${Math.round(n / 30.4)} mesi`; }
function fmonths(n) {
  if (n % 12 === 0) return n === 12 ? '1 anno' : `${n / 12} anni`;
  return `${n} mesi`;
}

/* ---------- stato ---------- */
function blank() { return { vehicles: [], records: [], rules: {}, settings: { theme: 'auto', color: 0, cur: null, view: 'detail', homeLayout: 'A' } }; }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.vehicles)) return normalize(s);
  } catch (e) { /* dati assenti o corrotti */ }
  return blank();
}
function normalize(s) {
  const b = blank();
  const o = {
    vehicles: s.vehicles || [], records: s.records || [], rules: s.rules || {},
    settings: Object.assign(b.settings, s.settings || {})
  };
  /* v1.1: il filtro olio e' unito al cambio olio; l'olio ha solo ricorrenza a km */
  o.records = o.records.filter(r => {
    if (r.type === 'filtro') {
      const m = o.records.find(x => x.vid === r.vid && x.type === 'olio' && x.date === r.date);
      if (m) { m.filter = true; return false; }
      r.type = 'olio'; r.filter = true; return true;
    }
    if (r.type === 'olio' && r.filter === undefined) r.filter = true;
    return true;
  });
  for (const k of Object.keys(o.rules)) {
    const [vid, tp] = k.split(':'), r = o.rules[k];
    if (tp === 'filtro') {
      if (!o.rules[vid + ':olio'] && r.everyKm) o.rules[vid + ':olio'] = { everyKm: r.everyKm, everyMonths: null, remindKm: r.remindKm || 0, remindDays: 0 };
      delete o.rules[k];
    }
  }
  for (const k of Object.keys(o.rules)) {
    const T = TYPES[k.split(':')[1]];
    if (T && T.kmOnly) {
      const r = o.rules[k]; r.everyMonths = null; r.remindDays = 0;
      if (!r.everyKm) delete o.rules[k];
    }
  }
  o.vehicles.forEach(v => { if (!Array.isArray(v.hidden)) v.hidden = []; });
  return o;
}
let S = load();
let tab = 'garage';
let histFilter = '';
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
  catch (e) { toast('Memoria piena: prova con una foto piu piccola'); return false; }
}
const curVeh = () => S.vehicles.find(v => v.id === S.settings.cur) || S.vehicles[0] || null;

/* ---------- logica scadenze ---------- */
function recsOf(vid, type) {
  return S.records.filter(r => r.vid === vid && (!type || r.type === type))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.km - a.km));
}
const lastRec = (vid, type) => recsOf(vid, type)[0] || null;
const lastFilter = vid => recsOf(vid, 'olio').find(r => r.filter) || null;
function oilLines(v) {
  const o = lastRec(v.id, 'olio'), f = lastFilter(v.id);
  if (!o) return '';
  const l = r => `${fd(r.date)} · ${fk(r.km)} km`;
  return `Ultimo olio: ${l(o)}<br>Ultimo filtro: ${f ? l(f) : 'mai registrato'}`;
}
const ruleOf = (vid, type) => S.rules[vid + ':' + type] || null;

/* Calcola lo stato di una scadenza dato km attuali, ultimo intervento e ricorrenza */
function evalStatus(km, last, rule, t) {
  if (!rule || !last) return { level: 'none' };
  const parts = []; let lvl = 0, prog = 0;
  if (rule.everyKm > 0 && last.km != null) {
    const used = km - last.km, left = rule.everyKm - used;
    prog = Math.max(prog, used / rule.everyKm);
    let l = 0, txt;
    if (left < 0) { l = 2; txt = `superato di ${fk(-left)} km`; }
    else { txt = `tra ${fk(left)} km`; if (left <= (rule.remindKm || 0)) l = 1; }
    parts.push({ kind: 'km', l, txt, used, left }); lvl = Math.max(lvl, l);
  }
  if (rule.everyMonths > 0) {
    const due = addMonths(last.date, rule.everyMonths), d = diffDays(t, due);
    const tot = Math.max(1, diffDays(last.date, due));
    prog = Math.max(prog, (tot - d) / tot);
    let l = 0, txt;
    if (d < 0) { l = 2; txt = `scaduta da ${fdays(-d)}`; }
    else if (d === 0) { l = 1; txt = 'scade oggi'; }
    else { txt = `tra ${fdays(d)}`; if (d <= (rule.remindDays || 0)) l = 1; }
    parts.push({ kind: 'time', l, txt, due, days: d }); lvl = Math.max(lvl, l);
  }
  if (!parts.length) return { level: 'none' };
  const head = parts.find(p => p.l === lvl) || parts[0];
  return { level: ['ok', 'soon', 'late'][lvl], parts, progress: Math.min(1, Math.max(0, prog)), headline: head.txt };
}
function status(v, type) {
  const rule = ruleOf(v.id, type), last = lastRec(v.id, type);
  return Object.assign(evalStatus(v.km, last, rule, today()), { rule, last });
}
function allAlerts() {
  const out = [];
  for (const v of S.vehicles) for (const type of typesOf(v)) {
    const st = status(v, type);
    if (st.level === 'late' || st.level === 'soon') out.push({ v, type, st });
  }
  return out.sort((a, b) => (b.st.level === 'late') - (a.st.level === 'late'));
}
const vehLevel = v => {
  let lv = 0;
  for (const t of typesOf(v)) { const l = status(v, t).level; if (l === 'late') return 2; if (l === 'soon') lv = 1; }
  return lv;
};
function ruleLabel(r) {
  const p = [];
  if (r.everyKm) p.push(`${fk(r.everyKm)} km`);
  if (r.everyMonths) p.push(fmonths(r.everyMonths));
  return 'ogni ' + p.join(' o ');
}
function addRecord(rec) {
  S.records.push(rec);
  const v = S.vehicles.find(x => x.id === rec.vid);
  if (v && rec.km > v.km) { v.km = rec.km; v.kmDate = rec.date; }
}
function kmPerDay(v) {
  const pts = S.records.filter(r => r.vid === v.id && r.km != null).map(r => ({ d: r.date, k: r.km }));
  pts.push({ d: v.kmDate || today(), k: v.km });
  pts.sort((a, b) => a.d.localeCompare(b.d));
  const a = pts[0], b = pts[pts.length - 1], span = diffDays(a.d, b.d);
  return span >= 30 && b.k > a.k ? (b.k - a.k) / span : 0;
}

/* ---------- calendario ---------- */
function eventFor(v, type) {
  const rule = ruleOf(v.id, type), last = lastRec(v.id, type);
  if (!rule || !last) return null;
  const T = TYPES[type], t = today();
  let date = null, rr = null, est = false;
  if (rule.everyMonths > 0) {
    date = addMonths(last.date, rule.everyMonths);
    const n = rule.everyMonths;
    rr = n % 12 === 0 ? `FREQ=YEARLY;INTERVAL=${n / 12}` : `FREQ=MONTHLY;INTERVAL=${n}`;
  }
  if (rule.everyKm > 0) {
    const left = rule.everyKm - (v.km - last.km), kpd = kmPerDay(v);
    if (kpd > 0) {
      const ed = addDays(t, Math.max(0, Math.ceil(left / kpd)));
      if (!date || ed < date) { date = ed; est = true; rr = null; }
    }
  }
  if (!date) return null;
  let late = false;
  if (date < t) { date = t; late = true; rr = null; }
  const det = [`Veicolo: ${v.name}${v.plate ? ' (' + v.plate + ')' : ''}`, `Km attuali: ${fk(v.km)}`,
    `Ultimo intervento: ${fd(last.date)} a ${fk(last.km)} km`, `Ricorrenza: ${ruleLabel(rule)}`];
  if (est) det.push('Data stimata in base ai tuoi km medi: controlla i km nell\'app.');
  return {
    uid: `${v.id}-${type}@scadenze-auto`, date, rrule: rr,
    title: `${T.label} - ${v.name}${est ? ' (stimata)' : ''}${late ? ' (scaduta)' : ''}`,
    details: det.join('\n'), alarm: rule.remindDays || 7
  };
}
function googleUrl(ev) {
  const d = ev.date.replace(/-/g, ''), e = addDays(ev.date, 1).replace(/-/g, '');
  let u = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(ev.title) +
    '&dates=' + d + '/' + e + '&details=' + encodeURIComponent(ev.details);
  if (ev.rrule) u += '&recur=' + encodeURIComponent('RRULE:' + ev.rrule);
  return u;
}
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function buildIcs(events) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Smemo-Garage//IT', 'CALSCALE:GREGORIAN'];
  for (const e of events) {
    L.push('BEGIN:VEVENT', `UID:${e.uid}`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(e.date, 1).replace(/-/g, '')}`,
      `SUMMARY:${icsEsc(e.title)}`, `DESCRIPTION:${icsEsc(e.details)}`);
    if (e.rrule) L.push('RRULE:' + e.rrule);
    L.push('BEGIN:VALARM', `TRIGGER:-P${e.alarm}D`, 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(e.title)}`, 'END:VALARM', 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}
function download(name, mime, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------- tema ---------- */
const LOGO_MARK = '<path d="M16 60V35L40 18l24 17v25z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M27 44h26M27 50h26M27 56h26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
const logo = s => `<svg class="logo" width="${s}" height="${s}" viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="18" fill="url(#lg)"/>${LOGO_MARK}</svg>`;
function setFavicon(c) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="80" height="80" rx="18" fill="url(#g)"/>${LOGO_MARK}</svg>`;
  const l = document.querySelector('link[rel=icon]');
  if (l) { l.type = 'image/svg+xml'; l.href = 'data:image/svg+xml,' + encodeURIComponent(svg); }
}
function applyTheme() {
  const st = S.settings, c = COLORS[st.color] || COLORS[0], r = document.documentElement;
  r.dataset.theme = st.theme;
  r.style.setProperty('--a1', c[0]); r.style.setProperty('--a2', c[1]);
  const dark = st.theme === 'dark' || (st.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = dark ? '#0e0f1e' : '#f3f4fb';
  setFavicon(c);
}

/* ---------- viste ---------- */
function render() {
  applyTheme();
  const v = curVeh();
  let h = '';
  if (tab === 'set') h = settingsHTML();
  else if (!v) h = emptyHTML();
  else h = tab === 'hist' ? histHTML(v) : tab === 'garage' ? garageHTML() : homeHTML(v);
  document.documentElement.classList.toggle('snap', tab === 'garage' && S.settings.homeLayout === 'C' && S.vehicles.length > 1);
  const navBtn = (t, ic, l) => `<button class="${tab === t ? 'on' : ''}" data-act="tab" data-t="${t}">${ico(ic)}<span>${l}</span></button>`;
  $('#app').innerHTML = h + `<nav class="nav"><div class="in">${navBtn('garage', 'home', 'Home')}${navBtn('home', 'list', 'Scadenze')}
    <button class="plus" data-act="addrec" aria-label="Registra intervento">${ico('plus')}</button>
    ${navBtn('hist', 'hist', 'Storico')}${navBtn('set', 'set', 'Impostazioni')}</div></nav>`;
}
function emptyHTML() {
  return `<div class="top"><div class="brand">${logo(32)}<h1>Smemo-Garage</h1></div></div><div class="card empty">${logo(72)}
    <h2 style="margin:12px 0 8px">Aggiungi il tuo primo veicolo</h2>
    <p class="muted">Registra auto e moto, poi tieni sotto controllo olio, cinghia, bollo e il resto.</p>
    <button class="btn pri" data-act="addveh">${ico('plus')} Aggiungi veicolo</button></div>`;
}
function chipsHTML() {
  const cur = curVeh();
  return `<div class="chips">${S.vehicles.map(v => `<button class="chip ${v.id === cur.id ? 'on' : ''}" data-act="veh" data-id="${v.id}">
    ${ico(v.type === 'moto' ? 'moto' : 'car')} ${esc(v.name)}${vehLevel(v) === 2 ? '<span class="dot"></span>' : ''}</button>`).join('')}
    <button class="chip" data-act="addveh">${ico('plus')} Veicolo</button></div>`;
}
const slugB = b => String(b || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function brandLogo(b, cls) {
  if (!b) return '';
  const s = typeof LOGOS !== 'undefined' && LOGOS[slugB(b)];
  return s ? `<span class="bl ${cls || ''}"><img alt="${esc(b)}" src="${s}"></span>`
    : `<span class="bl ini ${cls || ''}" aria-label="${esc(b)}">${esc(b.trim()[0].toUpperCase())}</span>`;
}
const photoStyle = p => `transform:translate(${(p.tx * 100).toFixed(2)}%,${(p.ty * 100).toFixed(2)}%) scale(${p.s})`;
function heroHTML(v, summary) {
  const p = v.photo;
  return `<div class="hero ${p ? 'hasph' : ''}">${p ? `<img class="pimg" alt="" src="${p.data}" style="${photoStyle(p)}">` : ''}
    <div class="row"><span class="small hl" style="opacity:.92">${brandLogo(v.brand, 'big')}${esc(v.plate || (v.type === 'moto' ? 'Moto' : 'Auto'))}</span>
      <button class="glass cam" data-act="photo" aria-label="Foto del veicolo">${ico('cam')}</button></div>
    <div class="km">${fk(v.km)} km</div>
    <div class="row small"><span>${summary}<br><span style="opacity:.85">${v.kmDate ? 'Aggiornato il ' + fd(v.kmDate) : ''}</span></span>
      <button class="glass" data-act="km">${ico('edit')} Aggiorna km</button></div></div>`;
}
function tileHTML(v, type) {
  const T = TYPES[type], st = status(v, type);
  let cls = 'no', txt;
  if (st.level === 'none') txt = st.last ? 'Senza ricorrenza' : 'Da impostare';
  else { cls = { ok: 'ok', soon: 'so', late: 'la' }[st.level]; txt = cap(st.headline); }
  return `<button class="tile" data-act="item" data-v="${v.id}" data-t="${type}"><b><span class="bd ${cls}"></span>${T.short}</b><span class="tx ${cls}">${txt}</span></button>`;
}
function homeHTML(v) {
  const sts = typesOf(v).map(t => status(v, t));
  const late = sts.filter(s => s.level === 'late').length, soon = sts.filter(s => s.level === 'soon').length;
  const summary = late || soon
    ? [late ? `${late} ${late === 1 ? 'scaduta' : 'scadute'}` : '', soon ? `${soon} in arrivo` : ''].filter(Boolean).join(' · ')
    : 'Tutto in regola';
  const over = S.settings.view === 'over';
  const alerts = over ? [] : allAlerts();
  const al = alerts.slice(0, 5).map(a => `<button class="alert ${a.st.level}" data-act="item" data-v="${a.v.id}" data-t="${a.type}">
    <span class="ic">${a.st.level === 'late' ? '⚠️' : '🔔'}</span>
    <span><b>${esc(a.v.name)} · ${TYPES[a.type].label}</b><br>${cap(a.st.parts.filter(p => p.l === (a.st.level === 'late' ? 2 : 1)).map(p => p.txt).join(' · ') || a.st.headline)}</span></button>`).join('');
  const body = over
    ? groupsOf(v).map(g => `<div class="sec" style="margin-top:14px">${g.label}</div><div class="tiles">${g.types.map(t => tileHTML(v, t)).join('')}</div>`).join('')
    : `${alerts.length ? `<div class="sec">Da controllare</div><div class="alerts">${al}${alerts.length > 5 ? `<div class="muted small" style="padding:2px 4px">e altre ${alerts.length - 5}</div>` : ''}</div>` : ''}
      ${groupsOf(v).map(g => `<div class="sec">${g.label}</div>${g.types.map(t => itemCard(v, t)).join('')}`).join('')}`;
  return `<div class="top"><div class="brand">${logo(32)}<h1>Smemo-Garage</h1></div><button class="btn" data-act="editveh" aria-label="Modifica veicolo">${ico('edit')}</button></div>
    ${chipsHTML()}${heroHTML(v, summary)}
    <div class="seg" style="margin:14px 0 10px"><button class="${over ? '' : 'on'}" data-act="view" data-v="detail">Dettaglio</button><button class="${over ? 'on' : ''}" data-act="view" data-v="over">Panoramica</button></div>
    ${typesOf(v).length ? body : `<div class="card empty"><p class="muted">Nessuna voce attiva per questo veicolo.</p><button class="btn pri" data-act="editveh">${ico('edit')} Scegli le voci</button></div>`}`;
}
/* ---------- home (garage) ---------- */
const LAYOUTS = { A: 'Colonna', B: 'Mosaico', C: 'Una per schermata' };
function vehCounts(v) {
  const sts = typesOf(v).map(t => status(v, t));
  return { late: sts.filter(s => s.level === 'late').length, soon: sts.filter(s => s.level === 'soon').length };
}
function garageTile(v, i, n, lay) {
  const { late, soon } = vehCounts(v), p = v.photo;
  const pill = late ? `<span class="gp la">${late} ${late === 1 ? 'scaduta' : 'scadute'}${soon ? ` · ${soon} in arrivo` : ''}</span>`
    : soon ? `<span class="gp so">${soon} in arrivo</span>` : '<span class="gp">Tutto in regola</span>';
  const al = lay === 'C' ? allAlerts().filter(a => a.v.id === v.id).slice(0, 3)
    .map(a => `<div class="ga">${a.st.level === 'late' ? '⚠️' : '🔔'} ${TYPES[a.type].label} · ${cap(a.st.headline)}</div>`).join('') : '';
  return `<button class="gt ${p ? 'hasph' : ''} ${i % 2 ? 'alt' : ''}" data-act="opveh" data-id="${v.id}">${p ? `<img class="pimg" alt="" src="${p.data}" style="${photoStyle(p)}">` : ''}
    <div class="gr">${v.brand ? `<span class="gi lg">${brandLogo(v.brand, 'big')}</span>` : `<span class="gi">${ico(v.type === 'moto' ? 'moto' : 'car')}</span>`}<span class="small">${esc(v.plate || '')}${lay === 'C' && n > 1 ? `${v.plate ? ' · ' : ''}${i + 1}/${n}` : ''}</span></div>
    <div class="gb"><div class="gn">${esc(v.name)}</div><div class="gk">${fk(v.km)} km</div>${al ? `<div class="gal">${al}</div>` : ''}${pill}</div></button>`;
}
function garageHTML() {
  const n = S.vehicles.length, lay = S.settings.homeLayout || 'A';
  const rows = lay === 'B' ? Math.ceil(n / 2) : n;
  const style = lay === 'B' ? `grid-template-rows:repeat(${rows},minmax(150px,1fr))` : '';
  return `<div class="gh"><div>${logo(58)}</div><h1>Smemo-Garage</h1><div class="small muted">${n} ${n === 1 ? 'veicolo' : 'veicoli'}</div></div>
    <div class="gl l${lay} ${lay === 'B' && n % 2 ? 'odd' : ''}" style="${style}">${S.vehicles.map((v, i) => garageTile(v, i, n, lay)).join('')}</div>
    <button class="gadd" data-act="addveh">${ico('plus')} Aggiungi veicolo</button>`;
}
function itemCard(v, type) {
  const T = TYPES[type], st = status(v, type);
  let badge, sub = '', extra = '', bar = '';
  if (st.level === 'none') {
    badge = `<span class="badge none">${st.last ? 'Senza ricorrenza' : 'Da impostare'}</span>`;
    sub = st.last ? `Ultimo: ${fd(st.last.date)} · ${fk(st.last.km)} km` : 'Nessun intervento registrato';
  } else {
    badge = `<span class="badge ${st.level}">${cap(st.headline)}</span>`;
    sub = `${cap(ruleLabel(st.rule))} · ultimo ${fd(st.last.date)}, ${fk(st.last.km)} km`;
    if (st.parts.length > 1) extra = `<div class="small ${st.level === 'ok' ? 'muted' : ''}" style="margin-top:4px">${st.parts.map(p => cap(p.txt)).join(' · ')}</div>`;
    bar = `<div class="bar ${st.level === 'late' ? 'late' : ''}"><i style="width:${Math.round(st.progress * 100)}%"></i></div>`;
  }
  return `<button class="card" data-act="item" data-v="${v.id}" data-t="${type}"><div class="item-h"><div class="ic">${T.icon}</div>
    <div class="t"><b>${T.label}</b><span class="small muted">${type === 'olio' && st.last ? (st.rule ? esc(cap(ruleLabel(st.rule))) + '<br>' : '') + oilLines(v) : esc(sub)}</span></div>${badge}</div>${extra}${bar}</button>`;
}
function recSub(r) {
  const p = [];
  if (r.type === 'olio') {
    const o = [r.oilType, r.oilBrand].filter(Boolean).join(' · ');
    if (o) p.push(o);
    if (r.filter) p.push('con filtro');
  }
  if (r.notes) p.push(r.notes);
  return p.join(' — ');
}
const typeName = r => r.type === 'olio' ? (r.filter ? 'Cambio olio + filtro' : 'Cambio olio') : (TYPES[r.type] ? TYPES[r.type].label : r.type);
function histHTML(v) {
  const list = recsOf(v.id, histFilter || null);
  const opts = `<option value="">Tutti i tipi</option>` + histGroups(v).map(g => `<optgroup label="${g.label}">${g.types.map(t => `<option value="${t}" ${histFilter === t ? 'selected' : ''}>${TYPES[t].label}</option>`).join('')}</optgroup>`).join('');
  return `<div class="top"><h1>Storico</h1></div>${chipsHTML()}
    <label class="f"><select id="hf">${opts}</select></label>
    ${list.length ? list.map(r => `<button class="card" data-act="editrec" data-id="${r.id}"><div class="item-h"><div class="ic">${TYPES[r.type] ? TYPES[r.type].icon : '•'}</div>
      <div class="t"><b>${typeName(r)}</b><span class="small muted">${fd(r.date)} · ${fk(r.km)} km</span>
      ${recSub(r) ? `<span class="small muted">${esc(recSub(r))}</span>` : ''}</div></div></button>`).join('')
      : `<div class="card empty"><div class="big">🗒️</div><p class="muted">Nessun intervento registrato.</p>
        <button class="btn pri" data-act="addrec">${ico('plus')} Registra intervento</button></div>`}`;
}
function settingsHTML() {
  const st = S.settings, v = curVeh();
  const seg = (a, b) => `<button class="${st.theme === a ? 'on' : ''}" data-act="theme" data-v="${a}">${b}</button>`;
  const notif = 'Notification' in window ? Notification.permission : 'unsupported';
  return `<div class="top"><h1>Impostazioni</h1></div>
    <div class="sec">Tema</div><div class="seg">${seg('auto', 'Automatico')}${seg('light', 'Chiaro')}${seg('dark', 'Scuro')}</div>
    <div class="sec">Aspetto della Home</div><div class="seg">${Object.keys(LAYOUTS).map(k => `<button class="${(st.homeLayout || 'A') === k ? 'on' : ''}" data-act="glayout" data-v="${k}">${k} · ${LAYOUTS[k]}</button>`).join('')}</div>
    <div class="sec">Colore</div><div class="sw">${COLORS.map((c, i) => `<button class="${st.color === i ? 'on' : ''}" data-act="color" data-i="${i}"
      style="background:linear-gradient(135deg,${c[0]},${c[1]})" aria-label="${c[2]}"></button>`).join('')}</div>
    <div class="sec">Promemoria</div>
    <div class="card"><b>Notifiche</b><p class="small muted" style="margin:4px 0 10px">Quando apri l'app ricevi una notifica per le scadenze vicine o superate. Chrome su Android non consente avvisi affidabili ad app chiusa: per quelli usa il calendario.</p>
      ${notif === 'granted' ? '<span class="badge ok">Attive</span>' : notif === 'unsupported' ? '<span class="badge none">Non supportate</span>'
        : `<button class="btn" data-act="notif">${ico('bell')} Attiva notifiche</button>`}</div>
    <div class="card"><b>Calendario</b><p class="small muted" style="margin:4px 0 10px">Esporta le scadenze di ${v ? esc(v.name) : 'un veicolo'} in un file .ics da importare in Google Calendar o nel calendario di Android. I singoli eventi si aggiungono anche dalla scheda di ogni scadenza.</p>
      <button class="btn" data-act="icsall" ${v ? '' : 'disabled'}>${ico('cal')} Esporta .ics</button></div>
    <div class="sec">Dati</div>
    <div class="card"><b>Backup</b><p class="small muted" style="margin:4px 0 10px">I dati sono solo su questo telefono. Salva un backup ogni tanto, per esempio su Drive.</p>
      <div class="btns" style="margin-top:0"><button class="btn" data-act="exp">${ico('dl')} Esporta</button><button class="btn" data-act="imp">${ico('ul')} Importa</button></div>
      <input type="file" id="impf" accept="application/json,.json" hidden></div>
    <button class="btn dan full" data-act="wipe">${ico('trash')} Elimina tutti i dati</button>
    <div class="brand" style="justify-content:center;margin-top:18px">${logo(22)}<span class="small muted">Smemo-Garage · v1.5</span></div>`;
}

/* ---------- sheet (finestre dal basso) ---------- */
let sheetOpen = false;
function openSheet(html) {
  $('#sheet').innerHTML = `<div class="back" data-act="close"></div><div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  $('#sheet').classList.add('open');
  document.body.classList.add('lock');
  if (!sheetOpen) { history.pushState({ sheet: 1 }, ''); sheetOpen = true; }
}
function hideSheet() {
  $('#sheet').classList.remove('open'); $('#sheet').innerHTML = '';
  document.body.classList.remove('lock');
  sheetOpen = false;
}
function closeSheet() {
  if (sheetOpen && history.state && history.state.sheet) history.back(); else hideSheet();
}
window.addEventListener('popstate', () => { if (sheetOpen) hideSheet(); });
let tt;
function toast(msg, cls) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast show ' + (cls || '');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), cls === 'late' ? 6000 : 3000);
}
const field = (label, inner) => `<label class="f"><span>${label}</span>${inner}</label>`;

function vtHTML(type, hidden) {
  const av = availFor(type);
  return GROUPS.map(g => {
    const ts = g.types.filter(t => av.includes(t));
    return ts.length ? `<div class="sec" style="margin:10px 2px 6px">${g.label}</div><div class="vt">${ts.map(t => `<label class="vr"><span>${TYPES[t].label}</span><input type="checkbox" name="show" value="${t}" ${hidden.includes(t) ? '' : 'checked'}><span class="tg"></span></label>`).join('')}</div>` : '';
  }).join('');
}
/* ---------- scelta veicolo: tre tendine (marca > modello > versione) ---------- */
const CHEV = '<svg class="dd-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
function Dropdown(root, onChange) {
  let items = [], value = '', ph = '', dis = true, act = -1, q = '';
  root.innerHTML = '<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false"><span class="dd-ic"></span><span class="dd-tx"></span>' + CHEV + '</button>' +
    '<div class="dd-list" hidden><input type="text" class="dd-q" placeholder="Cerca" aria-label="Cerca" hidden><div class="dd-items" role="listbox"></div></div>';
  const btn = root.querySelector('.dd-btn'), list = root.querySelector('.dd-list'), box = root.querySelector('.dd-items'), qi = root.querySelector('.dd-q');
  const vis = () => items.filter(i => i.t.toLowerCase().includes(q.toLowerCase()));
  const cur = () => items.find(i => i.v === value);
  function paintBtn() {
    const it = cur();
    root.querySelector('.dd-ic').innerHTML = it && it.ic ? it.ic : '';
    const t = root.querySelector('.dd-tx'); t.textContent = it ? it.t : ph; t.classList.toggle('ph', !it);
    btn.disabled = dis;
  }
  function paintList() {
    const v = vis();
    box.innerHTML = v.length ? v.map((i, n) => `<div class="dd-item${i.v === value ? ' sel' : ''}${n === act ? ' act' : ''}" role="option" data-v="${esc(i.v)}">${i.ic || ''}<span>${esc(i.t)}</span></div>`).join('') : '<div class="dd-empty">Nessun risultato</div>';
    const x = box.querySelector('.act'); if (x) x.scrollIntoView({ block: 'nearest' });
  }
  function open() {
    if (dis) return;
    document.querySelectorAll('.dd.open').forEach(d => d.dispatchEvent(new Event('close')));
    root.classList.add('open'); list.hidden = false; btn.setAttribute('aria-expanded', 'true');
    qi.hidden = items.length <= 8; q = ''; qi.value = '';
    act = Math.max(0, vis().findIndex(i => i.v === value)); paintList();
    list.scrollIntoView({ block: 'nearest' });
    if (items.length > 8) qi.focus();
  }
  function close() { root.classList.remove('open'); list.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  function pick(v) { value = v; paintBtn(); close(); btn.focus(); onChange(v); }
  root.addEventListener('close', close);
  btn.addEventListener('click', () => root.classList.contains('open') ? close() : open());
  btn.addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); } });
  list.addEventListener('keydown', e => {
    const v = vis();
    if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(v.length - 1, act + 1); paintList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); paintList(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (v[act]) pick(v[act].v); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); btn.focus(); }
  });
  qi.addEventListener('input', () => { q = qi.value; act = 0; paintList(); });
  box.addEventListener('mousedown', e => e.preventDefault());
  box.addEventListener('click', e => { const i = e.target.closest('.dd-item'); if (i) pick(i.dataset.v); });
  return {
    set(its, placeholder, disabled, val) { items = its; ph = placeholder; dis = disabled; value = val && its.some(i => i.v === val) ? val : ''; close(); paintBtn(); },
    get value() { return value; },
    get text() { const i = cur(); return i ? i.t : ''; }
  };
}
document.addEventListener('click', e => document.querySelectorAll('.dd.open').forEach(d => { if (!d.contains(e.target)) d.dispatchEvent(new Event('close')); }));

let VP = null; /* stato del selettore nella scheda aperta */
const verLab = x => x[0] + ' · ' + x[1] + '–' + (x[2] || 'oggi');
const yearOpts = (list, sel) => list.map(y => `<option ${String(y) === String(sel) ? 'selected' : ''}>${y}</option>`).join('');
function vehForm(v) {
  const t = v ? v.type : 'auto';
  openSheet(`<h2>${v ? 'Modifica veicolo' : 'Nuovo veicolo'}</h2><form data-form="veh" data-id="${v ? v.id : ''}">
    <div class="seg" id="vtseg" style="margin-bottom:12px"><button type="button" class="${t === 'auto' ? 'on' : ''}" data-act="vtype" data-v="auto">Auto</button><button type="button" class="${t === 'moto' ? 'on' : ''}" data-act="vtype" data-v="moto">Moto</button></div>
    <input type="hidden" name="type" value="${t}">
    <div id="pick">
      <div class="fd"><span>Marca</span><div class="dd" id="ddb"></div></div>
      <div class="fd"><span>Modello</span><div class="dd" id="ddm"></div></div>
      <div class="fd"><span>Versione</span><div class="dd" id="ddv"></div></div>
    </div>
    <div id="man" hidden>
      ${field('Marca', `<input name="mbrand" maxlength="30" placeholder="Fiat" value="${esc(v?.brand)}">`)}
      ${field('Modello', `<input name="mmodel" maxlength="30" placeholder="Panda" value="${esc(v?.model)}">`)}
      ${field('Versione (facoltativa)', `<input name="mversion" maxlength="40" placeholder="1.2 69 CV" value="${esc(v?.version)}">`)}
    </div>
    <p style="margin:-2px 0 12px"><button type="button" class="lk" id="vman" data-act="vman">Non trovi il tuo? Inserisci a mano</button></p>
    <div class="two">${field('Anno immatricolazione', `<select name="year" id="vyear"></select>`)}
    ${field('Targa (facoltativa)', `<input name="plate" maxlength="12" placeholder="AB123CD" value="${esc(v?.plate)}" style="text-transform:uppercase">`)}</div>
    ${field('Chilometri attuali', `<input name="km" type="number" inputmode="numeric" min="0" required value="${v ? v.km : ''}" placeholder="84320">`)}
    ${field('Nome', `<input name="name" id="vname" required maxlength="40" placeholder="Fiat Panda" value="${esc(v?.name)}">`)}
    <div class="vh"><b>Voci da mostrare</b><button type="button" class="lk" data-act="showall">Tutte</button></div>
    <p class="small muted" style="margin:2px 0 0">Quelle disattivate spariscono da scadenze, promemoria e calendario. Lo storico resta.</p>
    <div id="vt">${vtHTML(t, v ? v.hidden || [] : [])}</div>
    <button class="btn pri full" type="submit">Salva</button>
    ${v ? `<div class="btns"><button type="button" class="btn dan" data-act="delveh">${ico('trash')} Elimina veicolo</button></div>` : ''}</form>`);
  initPicker(v);
}
function initPicker(v) {
  const f = $('form[data-form=veh]'), NOW = new Date().getFullYear();
  const P = VP = { t: v ? v.type : 'auto', man: false, dirty: !!v, f };
  P.b = Dropdown($('#ddb'), () => pB()); P.m = Dropdown($('#ddm'), () => pM()); P.v = Dropdown($('#ddv'), () => pV());
  const yr = $('#vyear');
  const setYears = (list, sel, blank) => { yr.innerHTML = (blank ? '<option value="">—</option>' : '') + yearOpts(list, sel); yr.disabled = !list.length && !blank; };
  const cat = () => CATALOG[P.t] || {};
  const brandItems = () => Object.keys(cat()).sort().map(b => ({ v: b, t: b, ic: brandLogo(b) }));
  const autoName = () => {
    if (P.dirty) return;
    $('#vname').value = P.man ? [f.elements.mbrand.value, f.elements.mmodel.value].filter(Boolean).join(' ') : [P.b.value, P.m.value].filter(Boolean).join(' ');
  };
  const reset = lvl => {
    if (lvl <= 1) P.m.set([], 'Prima scegli la marca', true);
    if (lvl <= 2) P.v.set([], 'Prima scegli il modello', true);
    setYears([], '');
  };
  function pB(keep) {
    reset(1);
    const b = P.b.value; if (!b) return;
    P.m.set(Object.keys(cat()[b]).sort().map(m => ({ v: m, t: m })), 'Seleziona il modello', false, keep && keep.m);
    if (P.m.value) pM(keep); autoName();
  }
  function pM(keep) {
    reset(2);
    const b = P.b.value, m = P.m.value; if (!m) return;
    const vs = cat()[b][m];
    P.v.set(vs.map((x, i) => ({ v: String(i), t: verLab(x) })), 'Seleziona la versione', false, keep && keep.vi);
    if (P.v.value) pV(keep); autoName();
  }
  function pV(keep) {
    const x = cat()[P.b.value][P.m.value][+P.v.value], ys = [];
    for (let y = x[2] || NOW; y >= x[1]; y--) ys.push(y);
    setYears(ys, keep && keep.y); autoName();
  }
  P.setType = t => {
    P.t = t; f.elements.type.value = t;
    f.querySelectorAll('#vtseg button').forEach(b => b.classList.toggle('on', b.dataset.v === t));
    P.b.set(brandItems(), 'Seleziona la marca', false); reset(1);
    if (!P.man) setYears([], '');
    const hid = [...f.querySelectorAll('input[name=show]:not(:checked)')].map(i => i.value);
    $('#vt').innerHTML = vtHTML(t, hid);
  };
  P.toggleMan = (on) => {
    P.man = on; $('#pick').hidden = on; $('#man').hidden = !on;
    $('#vman').textContent = on ? 'Scegli dal catalogo' : 'Non trovi il tuo? Inserisci a mano';
    if (on) setYears(Array.from({ length: 45 }, (_, i) => NOW - i), v && v.year, true);
    else { reset(1); P.b.set(brandItems(), 'Seleziona la marca', false); }
  };
  /* stato iniziale: se il veicolo ha marca/modello presenti nel catalogo uso le tendine, altrimenti inserimento manuale */
  P.b.set(brandItems(), 'Seleziona la marca', false, v && v.brand); reset(1);
  const inCat = v && v.brand && cat()[v.brand] && cat()[v.brand][v.model];
  if (inCat) {
    const vi = cat()[v.brand][v.model].findIndex(x => x[0] === v.version);
    pB({ m: v.model, vi: vi >= 0 ? String(vi) : '', y: v.year });
  } else if (v) P.toggleMan(true);
  f.addEventListener('input', e => {
    if (e.target.id === 'vname') P.dirty = true;
    else if (P.man && /^m(brand|model)$/.test(e.target.name)) autoName();
  });
}
function vehFields(f) {
  const man = VP && VP.man, g = n => (f.elements[n] ? f.elements[n].value.trim() : '');
  let brand, model, version;
  if (man) { brand = g('mbrand'); model = g('mmodel'); version = g('mversion'); }
  else if (VP && VP.b) { brand = VP.b.value; model = VP.m.value; version = VP.v.value ? VP.v.text.split(' · ')[0] : ''; }
  return { brand: brand || '', model: model || '', version: version || '', year: num(g('year')) || null };
}
function kmForm(v) {
  openSheet(`<h2>Aggiorna chilometri</h2><p class="muted small" style="margin-top:-6px">${esc(v.name)}: ora ${fk(v.km)} km</p>
    <form data-form="km">${field('Km attuali', `<input name="km" type="number" inputmode="numeric" min="0" required value="${v.km}" autofocus>`)}
    <button class="btn pri full" type="submit">Salva</button></form>`);
}
function recForm(r, type) {
  const v = curVeh(), t = r ? r.type : (type || 'olio');
  openSheet(`<h2>${r ? 'Modifica intervento' : 'Registra intervento'}</h2><p class="muted small" style="margin-top:-6px">${esc(v.name)}</p>
    <form data-form="rec" data-id="${r ? r.id : ''}">
    ${field('Tipo', `<select name="type" id="rtype">${groupsOf(v, r ? r.type : null).map(g => `<optgroup label="${g.label}">${g.types.map(k => `<option value="${k}" ${k === t ? 'selected' : ''}>${TYPES[k].label}</option>`).join('')}</optgroup>`).join('')}</select>`)}
    <div class="two">${field('Data', `<input name="date" type="date" required value="${r ? r.date : today()}" max="2100-12-31">`)}
    ${field('Km', `<input name="km" type="number" inputmode="numeric" min="0" required value="${r ? r.km : v.km}">`)}</div>
    <div id="oilf" style="${t === 'olio' ? '' : 'display:none'}">
      <input type="hidden" name="filter" id="oilmode" value="${!r || r.filter ? '1' : ''}">
      <div class="seg" id="oilseg" style="margin:0 0 12px"><button type="button" class="${!r || r.filter ? '' : 'on'}" data-act="oilmode" data-v="">Solo olio</button><button type="button" class="${!r || r.filter ? 'on' : ''}" data-act="oilmode" data-v="1">Olio + filtro</button></div>
      <div class="two">
      ${field('Tipo olio', `<input name="oilType" placeholder="5W-30" maxlength="30" value="${esc(r?.oilType)}">`)}
      ${field('Marca', `<input name="oilBrand" placeholder="Castrol" maxlength="30" value="${esc(r?.oilBrand)}">`)}</div></div>
    ${field('Note (facoltative)', `<textarea name="notes" rows="2" maxlength="200">${esc(r?.notes)}</textarea>`)}
    <button class="btn pri full" type="submit">Salva</button>
    ${r ? `<div class="btns"><button type="button" class="btn dan" data-act="delrec" data-id="${r.id}">${ico('trash')} Elimina</button></div>` : ''}</form>`);
}
function ruleForm(v, type) {
  const T = TYPES[type], P = PRESETS[type] || {}, old = ruleOf(v.id, type), last = lastRec(v.id, type), hasKm = T.km > 0, hasMo = !T.kmOnly;
  const r = old || { everyKm: T.km || null, everyMonths: T.mo || null, remindKm: T.km ? Math.round(T.km / 15 / 100) * 100 : null, remindDays: hasMo ? 30 : 0 };
  const chips = (name, vals, fmt) => `<div class="pre">${vals.map(x => `<button type="button" class="pc" data-act="preset" data-f="${name}" data-v="${x}">${fmt(x)}</button>`).join('')}</div>`;
  const pf = (label, name, val, ph, vals, fmt) => `<div class="pf">${field(label, `<input name="${name}" type="number" inputmode="numeric" min="0" value="${val ?? ''}" placeholder="${ph}">`)}${chips(name, vals, fmt)}</div>`;
  openSheet(`<h2>${T.icon} Ricorrenza: ${T.label}</h2>${T.kmOnly ? '<p class="small muted" style="margin-top:-6px">Solo a chilometri.</p>' : ''}
    <form data-form="rule" data-t="${type}">
    ${hasKm ? `<div class="sec" style="margin-top:4px">Chilometri</div>${pf('Ogni (km)', 'everyKm', r.everyKm, '15000', P.km || [], fk)}${pf('Avviso km prima', 'remindKm', r.remindKm, '1000', REM_KM, fk)}` : ''}
    ${hasMo ? `<div class="sec" style="margin-top:4px">Tempo</div>${pf('Ogni (mesi)', 'everyMonths', r.everyMonths, '12', P.mo || [], fmonths)}${pf('Avviso giorni prima', 'remindDays', r.remindDays, '30', REM_DAYS, x => x + ' gg')}` : ''}
    ${last ? `<p class="small muted">${type === 'olio' ? oilLines(v) : `Ultimo intervento: ${fd(last.date)} a ${fk(last.km)} km`}</p>`
      : `<p class="small muted">Nessun intervento registrato: indica l'ultimo, serve per il calcolo.</p>
        <div class="two">${field('Data ultimo', `<input name="lastDate" type="date" required value="${today()}">`)}
        ${field('Km ultimo', `<input name="lastKm" type="number" inputmode="numeric" min="0" required value="${v.km}">`)}</div>`}
    <div class="prev" id="prev" hidden></div>
    <button class="btn pri full" type="submit">Salva ricorrenza</button>
    ${old ? `<div class="btns"><button type="button" class="btn dan" data-act="delrule" data-t="${type}">Rimuovi ricorrenza</button></div>` : ''}</form>`);
  previewRule($('form[data-form=rule]'));
}
function ruleFromForm(f) {
  const g = n => f.elements[n] ? f.elements[n].value : '';
  const r = { everyKm: pos(g('everyKm')), everyMonths: pos(g('everyMonths')), remindKm: num(g('remindKm')) || 0, remindDays: num(g('remindDays')) || 0 };
  return r.everyKm || r.everyMonths ? r : null;
}
/* Anteprima/alert in tempo reale mentre si imposta la ricorrenza */
function previewRule(f) {
  const el = $('#prev'); if (!el || !f) return;
  f.querySelectorAll('.pc').forEach(c => c.classList.toggle('on', f.elements[c.dataset.f].value === c.dataset.v));
  const v = curVeh(), type = f.dataset.t, rule = ruleFromForm(f);
  let last = lastRec(v.id, type);
  if (!last && f.elements.lastDate) {
    const k = num(f.elements.lastKm.value);
    if (f.elements.lastDate.value && k != null) last = { date: f.elements.lastDate.value, km: k };
  }
  if (!rule || !last) { el.hidden = true; return; }
  const km = Math.max(v.km, last.km), st = evalStatus(km, last, rule, today());
  const lines = st.parts.map(p => {
    if (p.kind === 'km') return p.left < 0
      ? `⚠️ Percorsi ${fk(p.used)} km dall'ultimo intervento su ${fk(rule.everyKm)}: <b>superato di ${fk(-p.left)} km</b>.`
      : `Percorsi ${fk(p.used)} km su ${fk(rule.everyKm)}: mancano ${fk(p.left)} km.`;
    return p.days < 0
      ? `⚠️ Scadenza del ${fd(p.due)}: <b>scaduta da ${fdays(-p.days)}</b>.`
      : `Prossima scadenza il ${fd(p.due)} (tra ${fdays(p.days)}).`;
  });
  el.className = 'prev ' + st.level; el.innerHTML = lines.join('<br>'); el.hidden = false;
}
function detailSheet(v, type) {
  const T = TYPES[type], st = status(v, type), hist = recsOf(v.id, type).slice(0, 6), ev = eventFor(v, type);
  const parts = st.level !== 'none' ? st.parts.map(p => `<div class="prev ${p.l === 2 ? 'late' : p.l === 1 ? 'soon' : 'ok'}" style="margin:0 0 8px">
    ${p.kind === 'km' ? `${fk(p.used)} km percorsi su ${fk(st.rule.everyKm)} · ${cap(p.txt)}` : `Scadenza ${fd(p.due)} · ${cap(p.txt)}`}</div>`).join('') : '';
  openSheet(`<h2>${T.icon} ${T.label}</h2><p class="muted small" style="margin-top:-6px">${esc(v.name)} · ${fk(v.km)} km${st.rule ? ' · ' + ruleLabel(st.rule) : ''}</p>
    ${parts || '<p class="muted">Nessuna ricorrenza impostata.</p>'}
    ${type === 'olio' && st.last ? `<div class="prev" style="margin:0 0 4px">${oilLines(v)}</div>` : ''}
    <div class="btns"><button class="btn pri" data-act="addrec" data-t="${type}">${ico('plus')} Registra</button>
      <button class="btn" data-act="rule" data-t="${type}">${ico('edit')} Ricorrenza</button></div>
    ${ev ? `<div class="btns"><a class="btn" target="_blank" rel="noopener" href="${esc(googleUrl(ev))}">${ico('cal')} Google Calendar</a>
      <button class="btn" data-act="ics" data-t="${type}">${ico('dl')} File .ics</button></div>
      <p class="small muted">${ev.title.includes('stimata') ? 'Data stimata dai tuoi km medi. ' : ''}Evento del ${fd(ev.date)}${ev.rrule ? ', con ripetizione' : ''}.</p>` : ''}
    <div class="hr"></div><div class="sec" style="margin-top:0">Ultimi interventi</div>
    ${hist.length ? hist.map(r => `<button class="hist" data-act="editrec" data-id="${r.id}"><span><b>${fd(r.date)}</b> · ${fk(r.km)} km<br><span class="small muted">${esc(recSub(r))}</span></span><span class="muted">${ico('edit')}</span></button>`).join('')
      : '<p class="muted small">Nessun intervento registrato.</p>'}`);
}

/* ---------- notifiche ---------- */
async function notifyDue() {
  if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const log = JSON.parse(localStorage.getItem('notified') || '{}'), t = today();
    for (const a of allAlerts()) {
      const k = a.v.id + a.type + a.st.level;
      if (log[k] === t) continue;
      log[k] = t;
      reg.showNotification(`${a.v.name}: ${TYPES[a.type].label}`, { body: cap(a.st.headline), icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: k });
    }
    localStorage.setItem('notified', JSON.stringify(log));
  } catch (e) { /* notifiche non disponibili */ }
}

/* ---------- eventi ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset, v = curVeh();
  switch (d.act) {
    case 'tab': tab = d.t; render(); scrollTo(0, 0); break;
    case 'opveh': S.settings.cur = d.id; save(); tab = 'home'; render(); scrollTo(0, 0); break;
    case 'glayout': S.settings.homeLayout = d.v; save(); render(); break;
    case 'vtype': if (VP) VP.setType(d.v); break;
    case 'vman': if (VP) VP.toggleMan(!VP.man); break;
    case 'showall': el.closest('form').querySelectorAll('input[name=show]').forEach(i => { i.checked = true; }); break;
    case 'veh': S.settings.cur = d.id; save(); render(); break;
    case 'addveh': vehForm(null); break;
    case 'editveh': vehForm(v); break;
    case 'delveh':
      if (confirm(`Eliminare ${v.name} con tutti i suoi interventi?`)) {
        S.records = S.records.filter(r => r.vid !== v.id);
        for (const k of Object.keys(S.rules)) if (k.startsWith(v.id + ':')) delete S.rules[k];
        S.vehicles = S.vehicles.filter(x => x.id !== v.id); S.settings.cur = null;
        save(); closeSheet(); render(); toast('Veicolo eliminato');
      } break;
    case 'km': kmForm(v); break;
    case 'addrec': if (!v) { vehForm(null); break; } recForm(null, d.t); break;
    case 'editrec': recForm(S.records.find(r => r.id === d.id)); break;
    case 'delrec':
      if (confirm('Eliminare questo intervento?')) {
        S.records = S.records.filter(r => r.id !== d.id); save(); closeSheet(); render(); toast('Intervento eliminato');
      } break;
    case 'item': {
      if (d.v) { S.settings.cur = d.v; save(); }
      detailSheet(curVeh(), d.t); render(); break;
    }
    case 'rule': ruleForm(v, d.t); break;
    case 'delrule':
      delete S.rules[v.id + ':' + d.t]; save(); closeSheet(); render(); toast('Ricorrenza rimossa'); break;
    case 'oilmode':
      $('#oilmode').value = d.v;
      el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); break;
    case 'preset': {
      const f = el.closest('form'), i = f.elements[d.f];
      i.value = d.v; i.dispatchEvent(new Event('input', { bubbles: true })); break;
    }
    case 'view': S.settings.view = d.v; save(); render(); break;
    case 'photo':
      if (v.photo) { draft = Object.assign({ vid: v.id }, v.photo); photoSheet(); } else $('#phf').click();
      break;
    case 'pickphoto': $('#phf').click(); break;
    case 'rmphoto': delete v.photo; draft = null; save(); closeSheet(); render(); toast('Foto rimossa'); break;
    case 'savephoto': {
      const x = S.vehicles.find(a => a.id === draft.vid), prev = x.photo;
      x.photo = { data: draft.data, s: draft.s, tx: draft.tx, ty: draft.ty };
      if (save()) { draft = null; closeSheet(); render(); toast('Foto salvata'); } else x.photo = prev;
      break;
    }
    case 'close': closeSheet(); break;
    case 'theme': S.settings.theme = d.v; save(); render(); break;
    case 'color': S.settings.color = +d.i; save(); render(); break;
    case 'notif':
      Notification.requestPermission().then(p => { render(); if (p === 'granted') { toast('Notifiche attivate'); notifyDue(); } else toast('Permesso negato'); }); break;
    case 'ics': {
      const ev = eventFor(v, d.t); if (!ev) break;
      download(`${TYPES[d.t].label}-${v.name}.ics`.replace(/\s+/g, '_'), 'text/calendar', buildIcs([ev])); break;
    }
    case 'icsall': {
      const evs = typesOf(v).map(t => eventFor(v, t)).filter(Boolean);
      if (!evs.length) { toast('Nessuna scadenza da esportare: imposta almeno una ricorrenza'); break; }
      download(`scadenze-${v.name}.ics`.replace(/\s+/g, '_'), 'text/calendar', buildIcs(evs)); toast(`${evs.length} eventi esportati`); break;
    }
    case 'exp': download(`scadenze-backup-${today()}.json`, 'application/json', JSON.stringify(S, null, 2)); toast('Backup salvato'); break;
    case 'imp': $('#impf').click(); break;
    case 'wipe':
      if (confirm('Eliminare TUTTI i dati dell\'app? L\'operazione non si può annullare.')) {
        S = blank(); save(); render(); toast('Dati eliminati');
      } break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const fdata = Object.fromEntries(new FormData(f)), v = curVeh();
  switch (f.dataset.form) {
    case 'veh': {
      const km = Math.max(0, num(fdata.km) || 0);
      const hidden = [...f.querySelectorAll('input[name=show]:not(:checked)')].map(i => i.value);
      if (f.dataset.id) {
        const x = S.vehicles.find(a => a.id === f.dataset.id);
        Object.assign(x, { name: fdata.name.trim(), plate: fdata.plate.trim().toUpperCase(), type: fdata.type, hidden }, vehFields(f));
        if (km !== x.km) { x.km = km; x.kmDate = today(); }
      } else {
        const x = { id: uid(), name: fdata.name.trim(), plate: fdata.plate.trim().toUpperCase(), type: fdata.type, km, kmDate: today(), hidden, ...vehFields(f) };
        S.vehicles.push(x); S.settings.cur = x.id;
      }
      save(); closeSheet(); render(); toast('Veicolo salvato'); break;
    }
    case 'km': {
      v.km = Math.max(0, num(fdata.km) || 0); v.kmDate = today();
      save(); closeSheet(); render();
      const n = allAlerts().filter(a => a.v.id === v.id && a.st.level === 'late').length;
      n ? toast(`Km aggiornati. Attenzione: ${n} ${n === 1 ? 'scadenza superata' : 'scadenze superate'}`, 'late') : toast('Km aggiornati'); break;
    }
    case 'rec': {
      const isOil = fdata.type === 'olio';
      const rec = { id: f.dataset.id || uid(), vid: v.id, type: fdata.type, date: fdata.date, km: Math.max(0, num(fdata.km) || 0),
        filter: isOil && !!fdata.filter,
        oilType: isOil ? (fdata.oilType || '').trim() : '', oilBrand: isOil ? (fdata.oilBrand || '').trim() : '',
        notes: (fdata.notes || '').trim() };
      if (f.dataset.id) {
        const i = S.records.findIndex(r => r.id === rec.id); S.records[i] = rec;
        if (rec.km > v.km) { v.km = rec.km; v.kmDate = rec.date; }
      } else addRecord(rec);
      save(); closeSheet(); render(); toast('Intervento salvato'); break;
    }
    case 'rule': {
      const type = f.dataset.t, rule = ruleFromForm(f);
      if (!rule) { toast('Indica una ricorrenza in km o in mesi'); break; }
      if (!lastRec(v.id, type)) {
        addRecord({ id: uid(), vid: v.id, type, date: fdata.lastDate, km: Math.max(0, num(fdata.lastKm) || 0), oilType: '', oilBrand: '', filter: type === 'olio', notes: 'Dato iniziale' });
      }
      S.rules[v.id + ':' + type] = rule; save(); closeSheet(); render();
      const st = status(v, type);
      st.level === 'late' ? toast(`Attenzione, ${TYPES[type].label.toLowerCase()}: ${st.headline}`, 'late') : toast('Ricorrenza salvata'); break;
    }
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'pz' && draft) { draft.s = e.target.value / 100; applyDraft(); return; }
  const f = e.target.closest('form[data-form=rule]'); if (f) previewRule(f);
});
document.addEventListener('change', e => {
  if (e.target.id === 'phf') {
    const file = e.target.files[0]; e.target.value = '';
    if (file) readPhoto(file).then(data => { draft = { vid: curVeh().id, data, s: 1, tx: 0, ty: 0 }; photoSheet(); }).catch(() => toast('Immagine non valida'));
    return;
  }
  if (e.target.id === 'rtype') $('#oilf').style.display = e.target.value === 'olio' ? '' : 'none';
  if (e.target.id === 'hf') { histFilter = e.target.value; render(); }
  if (e.target.id === 'impf' && e.target.files[0]) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        if (!Array.isArray(j.vehicles) || !Array.isArray(j.records)) throw 0;
        if (confirm(`Importare ${j.vehicles.length} veicoli e ${j.records.length} interventi? I dati attuali verranno sostituiti.`)) {
          S = normalize(j); save(); render(); toast('Backup importato');
        }
      } catch (err) { toast('File non valido'); }
    };
    rd.readAsText(e.target.files[0]);
  }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && !sheetOpen) { render(); notifyDue(); } });
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ---------- foto del veicolo ---------- */
let draft = null;
function readPhoto(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.78));
    };
    im.onerror = () => rej(new Error('img'));
    im.src = u;
  });
}
function photoSheet() {
  openSheet(`<h2>Foto del veicolo</h2>
    <div class="pbox" id="pbox"><img id="pimg" class="pimg" alt="" src="${draft.data}" style="${photoStyle(draft)}"></div>
    <p class="small muted">Trascina per spostare. Pizzica o usa il cursore per ingrandire.</p>
    <label class="f"><span>Zoom</span><input id="pz" type="range" min="100" max="400" value="${Math.round(draft.s * 100)}"></label>
    <button class="btn pri full" data-act="savephoto">Salva</button>
    <div class="btns"><button class="btn" data-act="pickphoto">${ico('cam')} Cambia foto</button><button class="btn dan" data-act="rmphoto">${ico('trash')} Rimuovi</button></div>`);
}
function applyDraft() {
  const lim = (draft.s - 1) / 2;
  draft.tx = Math.max(-lim, Math.min(lim, draft.tx)); draft.ty = Math.max(-lim, Math.min(lim, draft.ty));
  const im = $('#pimg'); if (im) im.style.cssText = photoStyle(draft);
}
const ptr = new Map(); let pd0 = 0;
const pinch = () => { if (ptr.size < 2) return 0; const [a, b] = [...ptr.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('#pbox'); if (!b || !draft) return;
  b.setPointerCapture && b.setPointerCapture(e.pointerId);
  ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); pd0 = pinch();
});
document.addEventListener('pointermove', e => {
  if (!draft || !ptr.has(e.pointerId)) return;
  const b = $('#pbox'); if (!b) return;
  const r = b.getBoundingClientRect(), prev = ptr.get(e.pointerId), cur = { x: e.clientX, y: e.clientY };
  ptr.set(e.pointerId, cur);
  if (ptr.size === 1) { draft.tx += (cur.x - prev.x) / r.width; draft.ty += (cur.y - prev.y) / r.height; }
  else if (ptr.size === 2) {
    const d = pinch();
    if (pd0 > 0) draft.s = Math.max(1, Math.min(4, draft.s * d / pd0));
    pd0 = d; $('#pz').value = Math.round(draft.s * 100);
  }
  applyDraft();
});
['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => { ptr.delete(e.pointerId); pd0 = pinch(); }));

/* ---------- avvio ---------- */
render();
notifyDue();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline non disponibile */ });
}
