import { c, e, preview, pend, val, dateText, priceText, slotsText, registrationState, registerLink, logoImg, mount } from './core.js';
import { systemArt } from './art.js';
import { sceneArt } from './scene.js';
import { gear, ufo, space, paintStarfield } from './cosmos.js';

const paths = { root: '', home: '', register: 'register/index.html', privacy: 'privacy/index.html' };
const reg = registrationState();
const cta = (cls = '') =>
  reg.state === 'closed'
    ? c.registration.waitlistUrl
      ? `<a class="btn btn-primary ${cls}" href="${e(c.registration.waitlistUrl)}" target="_blank" rel="noopener"><span>ลงชื่อรอคิว</span></a>`
      : `<span class="btn btn-disabled ${cls}">ปิดรับสมัครแล้ว</span>`
    : registerLink(paths, `btn btn-primary ${cls}`);

// ตัดบรรทัดเฉพาะตรงช่องว่าง ไม่ให้วลีภาษาไทยถูกแยกกลางคำ
const phrases = t => t.split(' ').map(w => `<span class="nowrap">${e(w)}</span>`).join(' ');
const extAttr = href => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');

// ไอคอนเส้นขนาด 24px (วาดเอง)
const ICONS = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ticket: '<path d="M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6z"/><path d="M14 7v2M14 11v2M14 15v2"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  blocks: '<rect x="3" y="12" width="8" height="8" rx="1.5"/><rect x="13" y="12" width="8" height="8" rx="1.5"/><rect x="8" y="3" width="8" height="8" rx="1.5"/>',
  flag: '<path d="M5 21V4M5 4h12l-2.5 4 2.5 4H5"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  cube: '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4zM4 7l8 4 8-4M12 11v10"/>',
  spark: '<path d="M12 3c.8 4.5 2.5 6.2 7 7-4.5.8-6.2 2.5-7 7-.8-4.5-2.5-6.2-7-7 4.5-.8 6.2-2.5 7-7zM19 16v4M17 18h4"/>',
  bolt: '<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z"/>',
  film: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5"/>',
  megaphone: '<path d="M4 10v4l10 5V5L4 10zM18 9a4 4 0 0 1 0 6M7 15.5V19h3v-2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20"/>',
};
const icon = name => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] ?? ICONS.spark}</svg>`;
const badge = name => `<span class="badge">${icon(name)}</span>`;

// มาสคอตแฮมสเตอร์ของ Hamster Hub (ภาพ 2D พื้นหลังโปร่งใส) — ตกแต่งล้วน จึงซ่อนจากโปรแกรมอ่านหน้าจอ
// ขนาดจริงของไฟล์ภาพ (กันหน้าเลื่อนตอนรูปโหลด) — astro-* และ emoji-* คือแฮมสเตอร์ชุดอวกาศที่เจนด้วย Canva AI
import { SIZES } from './sizes.js';
const hamster = (kind, cls = '', eager = false) => {
  const [w, h] = SIZES[kind] ?? [400, 480];
  return `<img class="ham ${cls}" src="assets/img/${kind.startsWith('emoji') ? '' : 'hamster-'}${kind}.webp" alt="" aria-hidden="true" width="${w}" height="${h}" decoding="async"${eager ? '' : ' loading="lazy"'}>`;
};

const sectionHead = (tag, kicker, title, lead = '') => `
<div class="section-head reveal">
  <p class="kicker"><span class="tag">${tag}</span>${kicker}</p>
  <h2>${phrases(title)}</h2>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
</div>`;

// ป้าย "รอยืนยัน" แสดงเฉพาะตอนผู้จัดตรวจทาน (เปิดลิงก์พร้อม ?review) — ผู้ชมทั่วไปเห็นเฉพาะข้อมูลที่ยืนยันแล้ว ไม่รก
const review = preview; // แสดงป้าย "รอยืนยันรายละเอียด" ไว้ ให้ทีมเห็นว่ายังขาดข้อมูลอะไร
// แถวข้อมูลในการ์ด: ซ่อนเมื่อไม่มีค่า (ยกเว้นโหมดตรวจทาน)
const row = (label, value) => (value || review ? `<div class="fact"><dt>${label}</dt><dd>${val(value)}</dd></div>` : '');

function hero() {
  const slotNote = c.timeSlots.arrangement ? '' : review ? ` ${pend('รอยืนยันการจัดรอบ')}` : '';
  const info = (ic, label, value) => `<div class="info">${badge(ic)}<div><dt>${label}</dt><dd>${value}</dd></div></div>`;
  return `
<section class="hero" id="top">
  ${sceneArt()}
  <div class="hero-ham" aria-hidden="true">${hamster('astro-jet', '', true)}</div>
  <div class="wrap hero-inner">
    <div class="hero-logo">
      <span class="hero-rays" aria-hidden="true"></span>
      <span class="hero-halo" aria-hidden="true"></span>
      ${logoImg('', 'hero-logo-img')}
    </div>
    <h1 class="gold">${phrases(c.camp.headline)}</h1>
    <p class="lead">${e(c.camp.subhead)}</p>
    <div class="hero-cta">
      ${cta('btn-lg')}
      <a class="btn btn-ghost btn-lg" href="#missions"><span>ดูภารกิจ 4 วัน</span></a>
    </div>
  </div>
</section>
<div class="wrap">
  <div class="summary reveal">
  <p class="sum-title"><span>สรุปค่ายใน 10 วินาที</span></p>
  <dl class="infobar">
    ${info('blocks', 'สร้างอะไร', 'เกมเอาตัวรอดธีมอวกาศ<small>เกมของตัวเอง 1 เกม เล่นได้จริง</small>')}
    ${info('laptop', 'ใช้อะไรสร้าง', 'Unity + AI<small>AI เป็นผู้ช่วย เราเป็นคนออกแบบเอง</small>')}
    ${info('calendar', 'เมื่อไร', `${dateText()} · 4 วัน<small>${slotsText()} น.${slotNote}</small>`)}
    ${info('ticket', 'ค่าสมัคร', `${priceText()}${c.price.unit ? ` ${e(c.price.unit)}` : ''}<small>${c.format.label ? e(c.format.label) : 'ตลอด 4 วัน'}</small>`)}
  </dl>
  </div>
</div>`;
}

const STAGE_HAM = ['astro-star', 'astro-pad', 'astro-flag'];

function about() {
  const look = [['var(--cyan)', 'bulb'], ['var(--pink)', 'blocks'], ['var(--gold)', 'flag']];
  return `
<section id="about" class="section">
  ${space('galaxy', 'cz-about')}
  <div class="wrap">
    ${sectionHead('STAGE 01', 'Super GameDev Camp', 'ค่ายนี้คืออะไร', e(c.about.body))}
    <ol class="stages">
      ${c.about.stages.map((s, i) => `
      <li class="stage reveal" style="--c:${look[i % 3][0]};--d:${i * 0.14}s">
        <span class="stage-orb" aria-hidden="true"><i class="stage-ring"></i>${hamster(STAGE_HAM[i % 3], 'stage-ham')}<b class="stage-n">0${i + 1}</b></span>
        <h3>${e(s.title)}</h3>
        <p>${e(s.text)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
}

// สามระบบ: โมเดล 3D สามตัวลอยอยู่ (ไม่มีกรอบ) → กดแล้วเปิดเวทีแนะนำระบบนั้นแบบเต็ม (แบบหน้าเลือกสายของเว็บ All for One)
// ถ้าเครื่องใช้ 3D ไม่ได้ จะเห็นแฮมสเตอร์ชุดอวกาศแทนโมเดล
const SYSTEM_HAM = { hero: 'astro-jet', world: 'astro-rocket', experience: 'astro-pad' };
const SYSTEM_C = { hero: 'var(--cyan)', world: 'var(--pink)', experience: 'var(--gold)' };

function build() {
  const sys = c.systems;
  const model = (s, cls) => `
        <span class="mdl ${cls}" data-model-host>
          <span class="mdl-glow" aria-hidden="true"></span>
          ${hamster(SYSTEM_HAM[s.id] ?? 'astro-wave', 'mdl-fallback')}
          <canvas data-model="${e(s.id)}" data-auto aria-hidden="true"></canvas>
          <span class="mdl-pad" aria-hidden="true"></span>
        </span>`;
  return `
<section id="build" class="section build">
  <div class="wrap">
    ${sectionHead('STAGE 02', '3 ระบบในเกมเดียว', 'สิ่งที่จะได้ทำ', 'ทั้งสามส่วนคือชิ้นส่วนของเส้นทางเรียนรู้เดียวกัน ทุกคนได้ทำครบ ไม่ต้องเลือกสายใดสายหนึ่ง')}
    <div class="trio" role="list">
      ${sys.map((s, i) => `
      <button class="trio-item reveal" role="listitem" type="button" data-sys="${i}" style="--c:${SYSTEM_C[s.id]};--d:${i * 0.12}s" aria-label="ดูระบบ ${e(s.title)}">
        ${model(s, 'mdl-sm')}
        <span class="trio-tag">SYSTEM 0${i + 1}</span>
        <span class="trio-name">${e(s.title)}</span>
        <span class="trio-more">กดเพื่อดู →</span>
      </button>`).join('')}
    </div>
    <div class="spot" id="spot" hidden>
      <button class="spot-back" type="button"><span aria-hidden="true">←</span> ดูทั้ง 3 ระบบ</button>
      ${sys.map((s, i) => `
      <article class="spot-slide" data-slide="${i}" style="--c:${SYSTEM_C[s.id]}" hidden>
        <p class="spot-word" aria-hidden="true">${e(s.word || '')}</p>
        <div class="spot-copy">
          <p class="spot-tag">SYSTEM 0${i + 1}</p>
          <h3>${e(s.title)}</h3>
          <p class="spot-text">${e(s.text)}</p>
          ${s.tagline ? `<p class="spot-quote">“${e(s.tagline)}”</p>` : ''}
          <button class="spot-cta" type="button" aria-expanded="false" aria-controls="spot-d${i}"><span>ดูรายละเอียดระบบนี้</span><span aria-hidden="true">→</span></button>
          <ul class="spot-details" id="spot-d${i}" hidden>${s.details.map(d => `<li>${e(d)}</li>`).join('')}</ul>
        </div>
        <div class="spot-stage">${model(s, 'mdl-lg')}<span class="spot-ring" aria-hidden="true"></span></div>
      </article>`).join('')}
      <button class="spot-arrow spot-prev" type="button" data-step="-1" aria-label="ระบบก่อนหน้า">←</button>
      <button class="spot-arrow spot-next" type="button" data-step="1" aria-label="ระบบถัดไป">→</button>
      <div class="spot-dots" role="tablist" aria-label="เลือกระบบ">
        ${sys.map((s, i) => `<button type="button" role="tab" data-go="${i}" style="--c:${SYSTEM_C[s.id]}" aria-label="${e(s.title)}">${hamster(SYSTEM_HAM[s.id], 'dot-ham')}</button>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

// ผลงานจริงจากค่ายครั้งก่อน: เทรลเลอร์ + ข้อมูลเกม + ภาพจากในเกม
function showcase() {
  const s = c.showcase;
  if (!s) return '';
  const v = s.video;
  // คลิปเดียวเด่น ๆ เต็มความกว้าง: ชื่อเกมซ้อนบนภาพตัวอย่าง (พื้นมืดไล่เฉด อ่านง่าย) หายไปเมื่อกดเล่น
  const cap = `
          <div class="feat-cap" aria-hidden="true">
            <p class="feat-kick">GAME PROJECT${s.credits?.length ? ` · โดย ${s.credits.map(e).join(' & ')}` : ''}</p>
            <p class="show-title">${e(s.title)}</p>
            <p class="show-tagline">${e(s.tagline || '')}<span class="feat-len">▶ TRAILER${v?.length ? ` ${e(v.length)}` : ''}</span></p>
          </div>`;
  const player = v ? `
      <div class="player monitor">
        <div class="player-screen">
          <video id="trailer" src="${e(v.src)}" poster="${e(v.poster)}" preload="none" playsinline controls aria-label="เทรลเลอร์เกม ${e(s.title)}"></video>
          <button class="player-play" type="button" aria-controls="trailer">
            <span class="player-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
            <span class="player-label">ดูเทรลเลอร์${v.length ? ` <span class="player-len">${e(v.length)}</span>` : ''}</span>
          </button>${cap}
        </div>
      </div>` : '';
  return `
<section id="showcase" class="section showcase">
  ${space('hole', 'cz-show')}
  <div class="wrap">
    ${sectionHead('REPLAY', 'ผลงานจริงจากค่าย', 'ผลงานเพื่อน ๆ ในค่าย Hamster Hub')}
    <div class="feature reveal">
      ${v ? hamster('astro-wave', 'ham-peek') : ''}${player}
      <div class="feat-foot">
        ${s.credits?.length ? `<p class="feat-credit">GAME PROJECT · โดย ${s.credits.map(e).join(' & ')}</p>` : ''}
        <p class="feat-about"><strong>${e(s.title)}</strong> — ${e(s.about)}</p>
        ${s.link ? `<div class="feat-link"><a class="btn btn-primary btn-sm" href="${e(s.link.href)}"${extAttr(s.link.href)}><span>${e(s.link.label)} ↗</span></a>${s.link.note ? `<span class="show-note">${e(s.link.note)}</span>` : ''}</div>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

function outcomes() {
  const emojis = ['emoji-map', 'emoji-cube', 'emoji-spark', 'emoji-bolt', 'emoji-film', 'emoji-laptop', 'emoji-mega'];
  const colors = ['var(--cyan)', 'var(--gold)', 'var(--pink)', 'var(--violet-hi)'];
  return `
<section id="outcomes" class="section">
  ${space('galaxy', 'cz-skill')}
  <div class="wrap">
    ${sectionHead('SKILL TREE', 'สิ่งที่จะได้ฝึก', 'ทักษะที่ได้ลงมือจริงตลอด 4 วัน')}
    <ul class="skills">
      ${c.outcomes.map((o, i) => `<li class="skill reveal" style="--c:${colors[i % 4]};--d:${(i % 7) * 0.06}s"><span class="skill-node" aria-hidden="true">${hamster(emojis[i % emojis.length], 'skill-emoji')}</span><span class="skill-name">${e(o)}</span></li>`).join('')}
    </ul>
    <p class="muted note skills-note reveal">เป้าหมายการเรียนรู้ของค่าย ไม่ใช่การรับประกันผลงานสำเร็จรูป${c.extras.certificate ? '' : review ? ` ส่วนเกียรติบัตรหรือไฟล์ผลงานที่ได้รับ ${pend()}` : ''}</p>
  </div>
</section>`;
}

// ภารกิจ 4 วัน: เส้นทางคดเคี้ยว แต่ละวันเป็นแท่นลอยที่มีแฮมสเตอร์ยืนอยู่ (แบบเดียวกับ Timeline ของเว็บ All for One)
// ตามด้วยการ์ดรายละเอียดของแต่ละวัน — ข้อความหัวข้อมาจากบรีฟของค่าย
const ROAD = {
  d: 'M11 44C24 44 24 76 37 76S50 40 63 40 74 72 88 72',
  m: 'M26 12C26 24 74 24 74 37S26 50 26 63 72 76 72 88',
};
function missions() {
  const d0 = c.dates;
  const dayDate = i => `${d0.startDay + i} ${d0.monthTh}`;
  const path = (cls, d) => `
      <svg class="rp ${cls}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="rgrad-${cls}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9a2ff"/><stop offset=".35" stop-color="#6fe6ff"/><stop offset=".7" stop-color="#ff8fb8"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>
        <path class="glow" d="${d}"/><path class="base" d="${d}"/><path class="prog" d="${d}" pathLength="1" stroke="url(#rgrad-${cls})"/>
      </svg>`;
  return `
<section id="missions" class="section journey" aria-labelledby="journey-title">
  ${space('galaxy', 'cz-road')}
  <div class="wrap">
    <div class="tl-head reveal">
      <h2 class="tl-title" id="journey-title">MISSION MAP</h2>
      <p class="tl-sub">ภารกิจ 4 วัน จากไอเดียบนกระดาษ สู่เกมที่เพื่อนได้ลองเล่น</p>
      <p class="tl-hint"><span aria-hidden="true">👆</span> กดที่แฮมสเตอร์แต่ละวันเพื่อดูรายละเอียดภารกิจ</p>
    </div>
    <div class="road">
      ${path('rp-d', ROAD.d)}${path('rp-m', ROAD.m)}
      <ol class="stops">
        ${c.agenda.map((d, i) => `
        <li class="stop s${i + 1}">
          <button class="stop-btn" type="button" data-day="${i}" aria-haspopup="dialog" aria-label="ดูรายละเอียด DAY ${i + 1} ${e(dayDate(i))}: ${e(d.title)}">
            <span class="isle reveal" style="--d:${0.1 + i * 0.18}s" aria-hidden="true"><span class="ped"></span>${hamster(d.art || 'happy', 'tl-ham')}<span class="tap" aria-hidden="true">+</span></span>
            <span class="lab reveal" style="--d:${0.2 + i * 0.18}s">
              <span class="n">DAY ${i + 1}${i === c.agenda.length - 1 ? ' · FINAL' : ''}</span>
              <span class="d">${e(dayDate(i))}</span>
              <b>${e(d.title)}</b>
              <span class="t">${e(d.summary)}</span>
              <span class="more">ดูรายละเอียด</span>
            </span>
          </button>
        </li>`).join('')}
      </ol>
    </div>
    <dialog class="day-dialog" id="day-dialog" aria-labelledby="dd-title">
      <form method="dialog" class="dd-close-row"><button class="dd-close" value="close" aria-label="ปิด">✕</button></form>
      <div class="dd-body"></div>
      <div class="dd-nav">
        <button type="button" class="btn btn-ghost btn-sm" data-step="-1"><span>← วันก่อนหน้า</span></button>
        <button type="button" class="btn btn-ghost btn-sm" data-step="1"><span>วันถัดไป →</span></button>
      </div>
    </dialog>
  </div>
</section>`;
}

function people() {
  const inst = c.instructors.length ? `
<section id="team" class="section">
  <div class="wrap">
    ${sectionHead('CREW', 'ทีมผู้สอน', 'คนที่จะร่วมภารกิจกับเรา')}
    <ul class="people">
      ${c.instructors.map(p => `
      <li class="card lift reveal">${p.photo ? `<img src="${e(p.photo)}" alt="" width="96" height="96" loading="lazy">` : ''}
        <h3>${e(p.name)}</h3><p class="role">${e(p.role)}</p><p>${e(p.experience)}</p></li>`).join('')}
    </ul>
  </div>
</section>` : '';
  const ev = c.evidence.length ? `
<section id="past" class="section">
  <div class="wrap">
    ${sectionHead('REPLAY', 'จากกิจกรรมที่ผ่านมา', 'บรรยากาศและผลงานจริง')}
    <ul class="evidence">
      ${c.evidence.map(x => x.type === 'quote'
        ? `<li class="card reveal"><blockquote><p>${e(x.caption)}</p><footer>${e(x.attribution)}</footer></blockquote></li>`
        : `<li class="reveal"><figure><img src="${e(x.src)}" alt="${e(x.alt)}" width="640" height="360" loading="lazy"><figcaption>${e(x.caption)}</figcaption></figure></li>`).join('')}
    </ul>
  </div>
</section>` : '';
  return inst + ev;
}

function prepare() {
  const a = c.audience, p = c.preparation;
  const who = [row('เหมาะกับ', a.who), row('พื้นฐานที่ต้องมี', a.prerequisites), row('ภาษาที่ใช้สอน', a.language), row('รูปแบบการทำงาน', a.teamMode), row('จำนวนที่รับ', a.capacity)].join('');
  const prep = [row('คอมพิวเตอร์และระบบปฏิบัติการ', p.computer), row('Unity', p.unity), row('อินเทอร์เน็ตและแพลตฟอร์ม', p.internet), row('ซอฟต์แวร์หรือบัญชีที่ต้องมี', p.accounts), row('ขั้นตอนเตรียมตัว', p.instructions)].join('');
  if (!who && !prep) return '';
  const panel = (color, ic, title, rows, delay) => rows ? `
      <div class="loadout reveal" style="--c:${color};--d:${delay}s">
        <header class="loadout-head">${badge(ic)}<h3>${title}</h3></header>
        <dl class="loadout-list">${rows}</dl>
      </div>` : '';
  return `
<section id="prepare" class="section">
  ${space('hole', 'cz-prep')}
  <div class="wrap">
    ${sectionHead('LOADOUT', 'ก่อนเข้าค่าย', 'ค่ายนี้เหมาะกับใคร และต้องเตรียมอะไร')}
    <div class="two-col">
      ${panel('var(--cyan)', 'user', 'ผู้เข้าร่วม', who, 0)}
      ${panel('var(--pink)', 'laptop', 'สิ่งที่ต้องเตรียม', prep, 0.12)}
    </div>
  </div>
</section>`;
}

// ของลอยประดับพื้นหลัง FAQ (แทนดาวหาง): อุปกรณ์คอมลอยนิ่งพร้อมหางแสง
function comets() {
  return `<div class="comets" aria-hidden="true">
    ${gear({ kind: 'mouse', x: 30, y: 21, s: 38, a: 135, c: 'var(--orange)', mode: 'drift' })}
    ${gear({ kind: 'laptop', x: 13, y: 80, s: 58, a: 140, c: 'var(--cyan)', mode: 'drift' })}
    ${gear({ kind: 'cd', x: 33, y: 62, s: 34, a: 125, c: 'var(--gold)', mode: 'drift' })}
    ${gear({ kind: 'gamepad', x: 70, y: 5, s: 46, a: 160, c: 'var(--pink)', mode: 'drift' })}
    ${ufo({ x: 82, y: 93, s: 96, cls: 'ufo--hover' })}
  </div>`;
}

const FAQ_SHOW = 6;

function faq() {
  const p = c.preparation, x = c.extras;
  const join = (...parts) => (parts.every(Boolean) ? parts.join(' ') : null);
  const items = [
    ['ต้องมีพื้นฐานมาก่อนไหม', c.audience.prerequisites],
    ['อายุหรือระดับชั้นเท่าไรจึงสมัครได้', c.audience.who],
    ['จะได้เรียนและสร้างอะไรบ้าง', 'ได้ฝึกออกแบบเกมและแผนที่ สร้างตัวละคร สกิล และศัตรูด้วย Unity จากนั้นประกอบ Gameplay กล้อง Cutscene และ UI เข้าด้วยกัน ก่อนทดสอบและนำเสนอผลงานในวันสุดท้าย'],
    ['ในค่ายใช้ AI และ Unity อย่างไร', 'Unity เป็น Game Engine หลักที่ใช้สร้างเกมตลอดค่าย ส่วน AI ทำหน้าที่เป็นผู้ช่วยในขั้นตอนพัฒนา ผู้เข้าร่วมยังเป็นคนออกแบบ ตัดสินใจ และลงมือทำเอง'],
    ['ผลงานที่ทำได้จะออกมาประมาณไหน', c.showcase ? `ดูตัวอย่างได้จากเกม ${c.showcase.title} ผลงานจริงของเพื่อน ๆ ในค่าย Hamster Hub ในส่วน “ผลงานเพื่อน ๆ” ด้านบน ขอบเขตผลงานของแต่ละคนขึ้นอยู่กับไอเดียและความคืบหน้าระหว่างค่าย` : null],
    ['ต้องใช้คอมพิวเตอร์หรือโปรแกรมอะไร', join(p.computer, p.unity)],
    ['ค่ายจัดที่ไหน รูปแบบใด', c.format.label ? [c.format.label, c.format.detail].filter(Boolean).join(' — ') : null],
    ['สองช่วงเวลาจัดอย่างไร', c.timeSlots.arrangement, `ช่วงเวลาที่แจ้งไว้คือ ${slotsText()} น. `],
    ['ทำงานเดี่ยวหรือเป็นทีม', c.audience.teamMode],
    ['ค่าสมัครเท่าไร รวมอะไรบ้าง', c.price.includes.length ? `${priceText()} รวม ${c.price.includes.join(', ')}` : null, `ค่าสมัคร ${priceText()} `],
    ['ยืนยันสิทธิ์เข้าค่ายอย่างไร', c.enrollment.confirmation],
    ['มีบันทึกย้อนหลังหรือเกียรติบัตรไหม', join(x.recordings, x.certificate)],
    ['หากสมัครแล้วเข้าร่วมไม่ได้ต้องทำอย่างไร', x.absencePolicy],
  ].filter(([, a, prefix]) => a || prefix || review);

  const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  return `
<section id="faq" class="section faq-section" aria-labelledby="faq-title">
  ${comets()}
  <div class="wrap faq-grid">
    <div class="faq-head reveal">
      <p class="faq-kicker">FAQ</p>
      <h2 id="faq-title">${phrases('คำถามที่พบบ่อย')}</h2>
      <div class="faq-mascot" aria-hidden="true">
        <p class="faq-bubble">มีคำถาม?</p>
        ${hamster('astro-think', 'faq-ham')}
      </div>
    </div>
    <div class="faq-list reveal" style="--d:.1s">
      ${items.map(([q, a, prefix = ''], k) => `
      <details class="faq-item"${k >= FAQ_SHOW ? ' data-more hidden' : ''}>
        <summary><span class="faq-q">${e(q)}</span><span class="faq-icon">${plus}</span></summary>
        <div class="faq-a"><p>${a ? e(a) : review ? `${e(prefix)}${pend()}` : `${e(prefix)}รายละเอียดเพิ่มเติมสอบถามได้ที่ LINE @smart-school หรือโทร 090-060-2555`}</p></div>
      </details>`).join('')}
      ${items.length > FAQ_SHOW ? `<button class="faq-more" type="button" aria-expanded="false">ดูคำถามอีก ${items.length - FAQ_SHOW} ข้อ <span aria-hidden="true">↓</span></button>` : ''}
    </div>
  </div>
</section>`;
}

// ปิดท้าย: แผงปล่อยยาน (ข้อมูลสำคัญ + ปุ่มสมัคร) คู่กับบัตรผ่านและแฮมสเตอร์ แล้วตามด้วยขั้นตอนการสมัคร
function joinSection() {
  const en = c.enrollment;
  const payNote = c.host
    ? `กดปุ่มสมัครเพื่อกรอกข้อมูลและดำเนินการต่อผ่านระบบรับสมัครของ ${e(c.camp.organizer)}`
    : en.payment
      ? `การชำระเงิน: ${e(en.payment.label)}${en.payment.detail ? ` — ${e(en.payment.detail)}` : ''}`
      : 'แบบฟอร์มสมัครเป็นการบันทึกใบสมัครเท่านั้น การยืนยันสิทธิ์เข้าค่ายจะแจ้งในขั้นตอนถัดไป';
  const meta = (ic, label, value) => `<li>${badge(ic)}<span><small>${label}</small>${value}</span></li>`;
  return `
<section id="join" class="section join">
  <div class="wrap">
    <div class="launch reveal">
      <div class="launch-sky" aria-hidden="true"><i class="launch-planet"></i><i class="launch-ring"></i></div>
      <div class="launch-copy">
        <p class="kicker"><span class="tag">READY?</span>สมัครเข้าค่าย</p>
        <h2><span class="nowrap">พร้อมออกเดินทาง</span><wbr><span class="nowrap">หรือยัง</span></h2>
        <p class="launch-price"><strong>${c.price.amount.toLocaleString('th-TH')}</strong><span>${e(c.price.currency)}${c.price.unit ? ` ${e(c.price.unit)}` : ''}<small>ค่าสมัครตลอด 4 วัน${c.price.includes.length ? ` · รวม ${e(c.price.includes.join(', '))}` : ''}</small></span></p>
        <ul class="launch-meta">
          ${meta('calendar', 'วันที่', dateText())}
          ${meta('clock', 'เวลา', c.timeSlots.slots.map(x => `<span class="nowrap">${e(x)}</span>`).join(' และ ') + '&nbsp;น.')}
          ${c.format.label ? meta('pin', 'รูปแบบ', e(c.format.label)) : ''}
        </ul>
        <div class="launch-cta">
          ${cta('btn-lg')}
          <a class="btn btn-ghost btn-lg" href="#faq"><span>มีคำถาม?</span></a>
        </div>
        ${reg.deadline && reg.state === 'open' ? `<p class="countdown" id="countdown" role="timer" aria-live="off"></p>` : ''}

      </div>
      <div class="crew" aria-hidden="true">
        <span class="crew-trail"></span>
        <div class="crew-rocket">${hamster('astro-rocket', 'crew-main')}</div>
        <p class="crew-bubble">ไปสร้างเกมกัน!</p>
        ${hamster('astro-cheer', 'crew-a')}
        ${hamster('astro-flag', 'crew-b')}
        <span class="crew-ground"></span>
      </div>
    </div>
    <div class="join-steps reveal">
      <h3>สมัครอย่างไร</h3>
      <ol class="steps">${en.steps.map((x, i) => `<li><span class="step-n">${i + 1}</span><span>${e(x)}</span></li>`).join('')}</ol>
      <p class="launch-note">${payNote}</p>
      ${en.confirmation ? `<p class="muted"><strong>การยืนยันสิทธิ์:</strong> ${e(en.confirmation)}</p>` : ''}
    </div>
  </div>
</section>`;
}

mount(paths, [hero(), about(), build(), showcase(), outcomes(), missions(), people(), prepare(), faq(), joinSection()].join(''));

paintStarfield();
// ฉากหลัง 3D จาก Blender — โหลดหลังหน้าเว็บพร้อมแล้ว ไม่ถ่วงการแสดงเนื้อหา
(window.requestIdleCallback || ((f) => setTimeout(f, 300)))(() => import('./bg3d.js').then((m) => m.initBg3d()).catch(() => {}), { timeout: 1200 });

// FAQ: แสดง 6 ข้อแรก ที่เหลือกดดูเพิ่ม
document.querySelector('.faq-more')?.addEventListener('click', ev => {
  document.querySelectorAll('.faq-item[data-more]').forEach(d => (d.hidden = false));
  ev.currentTarget.remove();
});

// สามระบบ: กดโมเดล → เวทีแนะนำระบบ (ซ้าย/ขวา/จุดด้านล่าง/ปุ่มกลับ) และปุ่มดูรายละเอียดเปิดรายการหัวข้อ
const spot = document.getElementById('spot');
if (spot) {
  const trio = document.querySelector('.trio');
  const slides = [...spot.querySelectorAll('.spot-slide')];
  const dots = [...spot.querySelectorAll('[data-go]')];
  let cur = 0;
  const go = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((sl, k) => (sl.hidden = k !== cur));
    dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === cur)));
    spot.style.setProperty('--c', slides[cur].style.getPropertyValue('--c'));
  };
  const open = i => {
    trio.hidden = true;
    spot.hidden = false;
    go(i);
    spot.scrollIntoView({ block: 'start', behavior: 'smooth' });
    spot.querySelector('.spot-back').focus({ preventScroll: true });
  };
  trio.querySelectorAll('[data-sys]').forEach(b => b.addEventListener('click', () => open(Number(b.dataset.sys))));
  spot.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => go(cur + Number(b.dataset.step))));
  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  spot.querySelector('.spot-back').addEventListener('click', () => {
    spot.hidden = true;
    trio.hidden = false;
    trio.querySelectorAll('[data-sys]')[cur].focus({ preventScroll: true });
  });
  spot.querySelectorAll('.spot-cta').forEach(b => b.addEventListener('click', () => {
    const list = document.getElementById(b.getAttribute('aria-controls'));
    const show = list.hidden;
    list.hidden = !show;
    b.setAttribute('aria-expanded', String(show));
    b.querySelector('span').textContent = show ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดระบบนี้';
  }));
  spot.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowLeft') go(cur - 1);
    if (ev.key === 'ArrowRight') go(cur + 1);
  });
}

// Mission Map: กดแฮมสเตอร์แต่ละวัน → เปิดหน้าต่างรายละเอียดภารกิจของวันนั้น
const dlg = document.getElementById('day-dialog');
if (dlg) {
  const body = dlg.querySelector('.dd-body');
  const colors = ['var(--violet-hi)', 'var(--cyan)', 'var(--pink)', 'var(--gold)'];
  let cur = 0;
  const show = i => {
    cur = (i + c.agenda.length) % c.agenda.length;
    const d = c.agenda[cur];
    dlg.style.setProperty('--c', colors[cur % 4]);
    body.innerHTML = `
      <div class="dd-head">
        ${hamster(d.art || 'happy', 'dd-ham', true)}
        <div>
          <p class="dd-day"><span>DAY ${cur + 1}</span>${e(`${c.dates.startDay + cur} ${c.dates.monthTh}`)}</p>
          <h3 id="dd-title">${e(d.title)}</h3>
          <p class="dd-sum">${e(d.summary)}</p>
        </div>
      </div>
      <ul class="dd-list">${d.topics.map(t => `<li>${e(typeof t === 'string' ? t : t.text)}${t.pending ? ` ${pend()}` : ''}</li>`).join('')}</ul>`;
  };
  document.querySelectorAll('.stop-btn').forEach(b => b.addEventListener('click', () => {
    show(Number(b.dataset.day));
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }));
  dlg.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(cur + Number(b.dataset.step))));
  // กดพื้นที่มืดรอบหน้าต่างเพื่อปิด
  dlg.addEventListener('click', ev => { if (ev.target === dlg) dlg.close(); });
}

// เทรลเลอร์: โหลดวิดีโอเมื่อกดเล่นเท่านั้น (preload="none") แล้วซ่อนปุ่มทับ
const trailer = document.getElementById('trailer');
if (trailer) {
  const shell = trailer.closest('.player');
  const btn = shell.querySelector('.player-play');
  btn.addEventListener('click', () => {
    shell.classList.add('playing');
    trailer.play().catch(() => {});
    trailer.focus();
  });
  trailer.addEventListener('play', () => shell.classList.add('playing'));
  // เลื่อนพ้นจอแล้วหยุดเล่น ไม่ให้เสียงเล่นค้างอยู่
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { if (!en.isIntersecting && !trailer.paused) trailer.pause(); }, { threshold: 0.15 }).observe(trailer);
  }
}

const cd = document.getElementById('countdown');
if (cd) {
  const tick = () => {
    const ms = reg.deadline.getTime() - Date.now();
    if (ms <= 0) return location.reload();
    const m = Math.floor(ms / 60000);
    cd.textContent = `ปิดรับสมัครในอีก ${Math.floor(m / 1440)} วัน ${Math.floor((m % 1440) / 60)} ชั่วโมง ${m % 60} นาที (เวลาประเทศไทย)`;
  };
  tick();
  setInterval(tick, 30000);
}

// ข้อมูลกิจกรรมแบบ structured data — เฉพาะเมื่อข้อเท็จจริงหลักยืนยันครบ และเป็นหน้าเดี่ยว (เว็บหลักมี metadata ของตัวเอง)
if (!preview && !c.host && c.dates.year && c.format.label) {
  const d = c.dates, pad = n => String(n).padStart(2, '0');
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: c.camp.name,
    description: c.camp.subhead,
    startDate: `${d.year}-${pad(d.month)}-${pad(d.startDay)}`,
    endDate: `${d.year}-${pad(d.month)}-${pad(d.endDay)}`,
    organizer: { '@type': 'Organization', name: c.camp.organizer },
    offers: { '@type': 'Offer', price: c.price.amount, priceCurrency: 'THB', url: c.site.baseUrl },
    url: c.site.baseUrl,
  });
  document.head.append(ld);
}
