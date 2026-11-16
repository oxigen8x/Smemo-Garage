'use strict';
/* Scadenze Auto e Moto - PWA senza dipendenze. Dati salvati in localStorage. */

const KEY = 'scadenze-auto-v1';
const COLORS = [
  ['#6c5ce7', '#00b4d8', 'Oceano'], ['#f43f5e', '#fb923c', 'Tramonto'], ['#10b981', '#3b82f6', 'Foresta'],
  ['#ec4899', '#8b5cf6', 'Orchidea'], ['#f59e0b', '#ef4444', 'Fuoco'], ['#0ea5e9', '#6366f1', 'Notte']
];
const TYPES = {
  olio:          { label: 'Cambio olio',          icon: '🛢️', km: 15000,  mo: 12 },
  filtro:        { label: 'Filtro olio',          icon: '⚙️', km: 15000,  mo: 12 },
  tagliando:     { label: 'Tagliando',            icon: '🔧', km: 15000,  mo: 12 },
  cinghia:       { label: 'Cinghia distribuzione', icon: '🔗', km: 120000, mo: 60 },
  gomme:         { label: 'Cambio gomme',         icon: '🔄', km: 40000,  mo: 60 },
  revisione:     { label: 'Revisione',            icon: '✅', km: 0,      mo: 24 },
  bollo:         { label: 'Bollo',                icon: '🧾', km: 0,      mo: 12 },
  assicurazione: { label: 'Assicurazione',        icon: '🛡️', km: 0,      mo: 12 }
};
const ORDER = Object.keys(TYPES);
const ICONS = {
  home: 'M4 11l8-7 8 7v9H4zM9 20v-6h6v6',
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
  bell: 'M6 17h12l-2-3v-4a4 4 0 0 0-8 0v4zM10 20h4'
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
function blank() { return { vehicles: [], records: [], rules: {}, settings: { theme: 'auto', color: 0, cur: null } }; }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.vehicles)) return normalize(s);
  } catch (e) { /* dati assenti o corrotti */ }
  return blank();
}
function normalize(s) {
  const b = blank();
  return {
    vehicles: s.vehicles || [], records: s.records || [], rules: s.rules || {},
    settings: Object.assign(b.settings, s.settings || {})
  };
}
let S = load();
let tab = 'home';
let histFilter = '';
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const curVeh = () => S.vehicles.find(v => v.id === S.settings.cur) || S.vehicles[0] || null;

/* ---------- logica scadenze ---------- */
function recsOf(vid, type) {
  return S.records.filter(r => r.vid === vid && (!type || r.type === type))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.km - a.km));
}
const lastRec = (vid, type) => recsOf(vid, type)[0] || null;
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
  for (const v of S.vehicles) for (const type of ORDER) {
    const st = status(v, type);
    if (st.level === 'late' || st.level === 'soon') out.push({ v, type, st });
  }
  return out.sort((a, b) => (b.st.level === 'late') - (a.st.level === 'late'));
}
const vehLevel = v => {
  let lv = 0;
  for (const t of ORDER) { const l = status(v, t).level; if (l === 'late') return 2; if (l === 'soon') lv = 1; }
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
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scadenze Auto//IT', 'CALSCALE:GREGORIAN'];
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
function applyTheme() {
  const st = S.settings, c = COLORS[st.color] || COLORS[0], r = document.documentElement;
  r.dataset.theme = st.theme;
  r.style.setProperty('--a1', c[0]); r.style.setProperty('--a2', c[1]);
  const dark = st.theme === 'dark' || (st.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = dark ? '#0e0f1e' : '#f3f4fb';
}

/* ---------- viste ---------- */
function render() {
  applyTheme();
  const v = curVeh();
  let h = '';
  if (tab === 'set') h = settingsHTML();
  else if (!v) h = emptyHTML();
  else h = tab === 'hist' ? histHTML(v) : homeHTML(v);
  const navBtn = (t, ic, l) => `<button class="${tab === t ? 'on' : ''}" data-act="tab" data-t="${t}">${ico(ic)}<span>${l}</span></button>`;
  $('#app').innerHTML = h + `<nav class="nav"><div class="in">${navBtn('home', 'home', 'Scadenze')}
    <button class="plus" data-act="addrec" aria-label="Registra intervento">${ico('plus')}</button>
    ${navBtn('hist', 'hist', 'Storico')}${navBtn('set', 'set', 'Impostazioni')}</div></nav>`;
}
function emptyHTML() {
  return `<div class="top"><h1>Garage</h1></div><div class="card empty"><div class="big">🚗</div>
    <h2 style="margin:8px 0">Aggiungi il tuo primo veicolo</h2>
    <p class="muted">Registra auto e moto, poi tieni sotto controllo olio, cinghia, bollo e il resto.</p>
    <button class="btn pri" data-act="addveh">${ico('plus')} Aggiungi veicolo</button></div>`;
}
function chipsHTML() {
  const cur = curVeh();
  return `<div class="chips">${S.vehicles.map(v => `<button class="chip ${v.id === cur.id ? 'on' : ''}" data-act="veh" data-id="${v.id}">
    ${ico(v.type === 'moto' ? 'moto' : 'car')} ${esc(v.name)}${vehLevel(v) === 2 ? '<span class="dot"></span>' : ''}</button>`).join('')}
    <button class="chip" data-act="addveh">${ico('plus')} Veicolo</button></div>`;
}
function homeHTML(v) {
  const sts = ORDER.map(t => status(v, t));
  const late = sts.filter(s => s.level === 'late').length, soon = sts.filter(s => s.level === 'soon').length;
  const summary = late || soon
    ? [late ? `${late} ${late === 1 ? 'scaduta' : 'scadute'}` : '', soon ? `${soon} in arrivo` : ''].filter(Boolean).join(' · ')
    : 'Tutto in regola';
  const alerts = allAlerts();
  const al = alerts.slice(0, 5).map(a => `<button class="alert ${a.st.level}" data-act="item" data-v="${a.v.id}" data-t="${a.type}">
    <span class="ic">${a.st.level === 'late' ? '⚠️' : '🔔'}</span>
    <span><b>${esc(a.v.name)} · ${TYPES[a.type].label}</b><br>${cap(a.st.parts.filter(p => p.l === (a.st.level === 'late' ? 2 : 1)).map(p => p.txt).join(' · ') || a.st.headline)}</span></button>`).join('');
  return `<div class="top"><h1>Garage</h1><button class="btn" data-act="editveh" aria-label="Modifica veicolo">${ico('edit')}</button></div>
    ${chipsHTML()}
    <div class="hero"><div class="row"><div><div class="small" style="opacity:.9">${esc(v.plate || (v.type === 'moto' ? 'Moto' : 'Auto'))}</div>
      <div class="km">${fk(v.km)} km</div></div>
      <button class="glass" data-act="km">${ico('edit')} Aggiorna km</button></div>
      <div class="row small" style="position:relative;z-index:1"><span>${summary}</span><span style="opacity:.85">${v.kmDate ? 'Aggiornato il ' + fd(v.kmDate) : ''}</span></div></div>
    ${alerts.length ? `<div class="sec">Da controllare</div><div class="alerts">${al}${alerts.length > 5 ? `<div class="muted small" style="padding:2px 4px">e altre ${alerts.length - 5}</div>` : ''}</div>` : ''}
    <div class="sec">Scadenze di ${esc(v.name)}</div>${ORDER.map(t => itemCard(v, t)).join('')}`;
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
    <div class="t"><b>${T.label}</b><span class="small muted">${esc(sub)}</span></div>${badge}</div>${extra}${bar}</button>`;
}
function recSub(r) {
  const p = [];
  if (r.oilType || r.oilBrand) p.push([r.oilType, r.oilBrand].filter(Boolean).join(' · '));
  if (r.notes) p.push(r.notes);
  return p.join(' — ');
}
function histHTML(v) {
  const list = recsOf(v.id, histFilter || null);
  const opts = `<option value="">Tutti i tipi</option>` + ORDER.map(t => `<option value="${t}" ${histFilter === t ? 'selected' : ''}>${TYPES[t].label}</option>`).join('');
  return `<div class="top"><h1>Storico</h1></div>${chipsHTML()}
    <label class="f"><select id="hf">${opts}</select></label>
    ${list.length ? list.map(r => `<button class="card" data-act="editrec" data-id="${r.id}"><div class="item-h"><div class="ic">${TYPES[r.type].icon}</div>
      <div class="t"><b>${TYPES[r.type].label}</b><span class="small muted">${fd(r.date)} · ${fk(r.km)} km</span>
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
    <p class="small muted" style="text-align:center;margin-top:16px">Scadenze Auto e Moto · v1.0</p>`;
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

function vehForm(v) {
  openSheet(`<h2>${v ? 'Modifica veicolo' : 'Nuovo veicolo'}</h2><form data-form="veh" data-id="${v ? v.id : ''}">
    ${field('Nome', `<input name="name" required maxlength="40" placeholder="Fiat Panda" value="${esc(v?.name)}">`)}
    <div class="two">${field('Targa (facoltativa)', `<input name="plate" maxlength="12" placeholder="AB123CD" value="${esc(v?.plate)}" style="text-transform:uppercase">`)}
    ${field('Tipo', `<select name="type"><option value="auto" ${v?.type !== 'moto' ? 'selected' : ''}>Auto</option><option value="moto" ${v?.type === 'moto' ? 'selected' : ''}>Moto</option></select>`)}</div>
    ${field('Chilometri attuali', `<input name="km" type="number" inputmode="numeric" min="0" required value="${v ? v.km : ''}" placeholder="84320">`)}
    <button class="btn pri full" type="submit">Salva</button>
    ${v ? `<div class="btns"><button type="button" class="btn dan" data-act="delveh">${ico('trash')} Elimina veicolo</button></div>` : ''}</form>`);
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
    ${field('Tipo', `<select name="type" id="rtype">${ORDER.map(k => `<option value="${k}" ${k === t ? 'selected' : ''}>${TYPES[k].label}</option>`).join('')}</select>`)}
    <div class="two">${field('Data', `<input name="date" type="date" required value="${r ? r.date : today()}" max="2100-12-31">`)}
    ${field('Km', `<input name="km" type="number" inputmode="numeric" min="0" required value="${r ? r.km : v.km}">`)}</div>
    <div id="oilf" style="${t === 'olio' ? '' : 'display:none'}"><div class="two">
      ${field('Tipo olio', `<input name="oilType" placeholder="5W-30" maxlength="30" value="${esc(r?.oilType)}">`)}
      ${field('Marca', `<input name="oilBrand" placeholder="Castrol" maxlength="30" value="${esc(r?.oilBrand)}">`)}</div></div>
    ${field('Note (facoltative)', `<textarea name="notes" rows="2" maxlength="200">${esc(r?.notes)}</textarea>`)}
    <button class="btn pri full" type="submit">Salva</button>
    ${r ? `<div class="btns"><button type="button" class="btn dan" data-act="delrec" data-id="${r.id}">${ico('trash')} Elimina</button></div>` : ''}</form>`);
}
function ruleForm(v, type) {
  const T = TYPES[type], old = ruleOf(v.id, type), last = lastRec(v.id, type), hasKm = T.km > 0;
  const r = old || { everyKm: T.km || null, everyMonths: T.mo || null, remindKm: T.km ? Math.round(T.km / 15 / 100) * 100 : null, remindDays: 30 };
  openSheet(`<h2>${T.icon} Ricorrenza: ${T.label}</h2><form data-form="rule" data-t="${type}">
    ${hasKm ? `<div class="two">${field('Ogni (km)', `<input name="everyKm" type="number" inputmode="numeric" min="0" value="${r.everyKm || ''}" placeholder="15000">`)}
      ${field('Avviso km prima', `<input name="remindKm" type="number" inputmode="numeric" min="0" value="${r.remindKm ?? ''}" placeholder="1000">`)}</div>` : ''}
    <div class="two">${field('Ogni (mesi)', `<input name="everyMonths" type="number" inputmode="numeric" min="0" value="${r.everyMonths || ''}" placeholder="12">`)}
      ${field('Avviso giorni prima', `<input name="remindDays" type="number" inputmode="numeric" min="0" value="${r.remindDays ?? ''}" placeholder="30">`)}</div>
    ${last ? `<p class="small muted">Ultimo intervento: ${fd(last.date)} a ${fk(last.km)} km</p>`
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
      const evs = ORDER.map(t => eventFor(v, t)).filter(Boolean);
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
      if (f.dataset.id) {
        const x = S.vehicles.find(a => a.id === f.dataset.id);
        Object.assign(x, { name: fdata.name.trim(), plate: fdata.plate.trim().toUpperCase(), type: fdata.type });
        if (km !== x.km) { x.km = km; x.kmDate = today(); }
      } else {
        const x = { id: uid(), name: fdata.name.trim(), plate: fdata.plate.trim().toUpperCase(), type: fdata.type, km, kmDate: today() };
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
      const rec = { id: f.dataset.id || uid(), vid: v.id, type: fdata.type, date: fdata.date, km: Math.max(0, num(fdata.km) || 0),
        oilType: fdata.type === 'olio' ? (fdata.oilType || '').trim() : '', oilBrand: fdata.type === 'olio' ? (fdata.oilBrand || '').trim() : '',
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
        addRecord({ id: uid(), vid: v.id, type, date: fdata.lastDate, km: Math.max(0, num(fdata.lastKm) || 0), oilType: '', oilBrand: '', notes: 'Dato iniziale' });
      }
      S.rules[v.id + ':' + type] = rule; save(); closeSheet(); render();
      const st = status(v, type);
      st.level === 'late' ? toast(`Attenzione, ${TYPES[type].label.toLowerCase()}: ${st.headline}`, 'late') : toast('Ricorrenza salvata'); break;
    }
  }
});

document.addEventListener('input', e => {
  const f = e.target.closest('form[data-form=rule]'); if (f) previewRule(f);
});
document.addEventListener('change', e => {
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

/* ---------- avvio ---------- */
render();
notifyDue();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline non disponibile */ });
}
