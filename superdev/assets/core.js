import config from './config.js';

export const c = config;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const e = s => String(s ?? '').replace(/[&<>"']/g, ch => ESC[ch]);

// ── การฝังในเว็บหลัก ────────────────────────────────────────────────
const host = c.host;
export const embedded = window.parent !== window;
export const onHost = Boolean(host && location.pathname.startsWith(host.staticPrefix));
// เปิดไฟล์ static ตรง ๆ บนเว็บหลัก → พาไปหน้า route จริงที่ฝังเว็บนี้ไว้
if (onHost && !embedded) {
  location.replace((location.pathname.includes('/register/') ? host.registerRoute : host.route) + location.hash);
}

// ── สถานะข้อมูล ─────────────────────────────────────────────────────
const gaps = list => list.filter(([v]) => !v).map(([, label]) => label);

// ต้องยืนยันก่อนเปิดจริง — ถ้ายังไม่ครบ โหมด live จะกลับไปแสดงแบบ preview
export const issues = gaps([
  [c.timeSlots.arrangement, 'รูปแบบการจัด 2 ช่วงเวลา'],
  [c.format.label, 'รูปแบบการจัด (ออนไลน์ / On-site) และสถานที่หรือแพลตฟอร์ม'],
  [c.audience.who, 'ช่วงอายุหรือระดับชั้นของผู้เข้าร่วม'],
  [c.preparation.computer, 'สเปกคอมพิวเตอร์และระบบปฏิบัติการที่รองรับ'],
  [c.contact.links.length, 'ช่องทางติดต่อผู้จัด'],
  // ระบบรับสมัครของเว็บหลักดูแล 3 เรื่องนี้เองเมื่อฝังผ่าน host
  ...(host ? [] : [
    [c.enrollment.endpoint, 'ระบบหลังบ้านสำหรับรับใบสมัคร'],
    [c.enrollment.contactMethod, 'ช่องทางติดต่อหลักในฟอร์มสมัคร'],
    [c.privacy.confirmed, 'นโยบายความเป็นส่วนตัวที่ผู้จัดอนุมัติ'],
  ]),
]);

export const preview = c.mode !== 'live' || issues.length > 0;

export const pend = (label = 'รอยืนยันรายละเอียด') => (preview ? `<span class="pending">${e(label)}</span>` : '');
export const val = v => (v ? e(v) : pend());

export const dateText = () => {
  const d = c.dates;
  return `${d.startDay}–${d.endDay} ${d.monthTh}${d.year ? ` ${d.year + 543}` : ''}`;
};
export const priceText = () => `${c.price.amount.toLocaleString('th-TH')} ${c.price.currency}`;
export const slotsText = () => c.timeSlots.slots.join(' และ ');

export function registrationState() {
  const dl = c.registration.deadline ? new Date(c.registration.deadline) : null;
  if (!dl || Number.isNaN(dl.getTime())) return { state: 'open', deadline: null };
  return { state: Date.now() > dl.getTime() ? 'closed' : 'open', deadline: dl };
}

// ลิงก์สมัคร: ในเว็บหลักชี้ไปหน้าสมัครของ host (และถูกดักเป็น postMessage เมื่อฝังอยู่)
export const registerLink = (paths, cls, label = 'สมัครเข้าค่าย') =>
  `<a class="${cls}" data-register href="${onHost ? host.registerRoute : paths.register}"${onHost ? ' target="_top"' : ''}><span>${label}</span></a>`;

const ext = href => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');

// โลโก้ไฟล์จริงมีขอบโปร่งใสซ้ายขวา จึงครอบด้วยกรอบสัดส่วนของตัวโลโก้ (ดู .logo-crop ใน CSS)
export const logoImg = (root, cls = '', decorative = false) =>
  `<span class="logo-crop ${cls}"${decorative ? ' aria-hidden="true"' : ''}><img src="${root}assets/img/logo.webp" alt="${decorative ? '' : e(c.camp.name)}" width="2000" height="667" decoding="async"></span>`;

const SPRITES = `
<svg width="0" height="0" class="sr-only" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3ad"/><stop offset=".45" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff8a1f"/></linearGradient>
    <symbol id="i-star" viewBox="0 0 64 64">
      <path d="M32 5l7.6 15.9 17.4 2.3-12.8 12 3.3 17.3L32 44.1 16.5 52.5l3.3-17.3L7 23.2l17.4-2.3z" fill="#b3541e" transform="translate(0 4)"/>
      <path d="M32 5l7.6 15.9 17.4 2.3-12.8 12 3.3 17.3L32 44.1 16.5 52.5l3.3-17.3L7 23.2l17.4-2.3z" fill="url(#g-gold)" stroke="#7a2f0a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="26" cy="29" r="2.4" fill="#7a2f0a"/><circle cx="38" cy="29" r="2.4" fill="#7a2f0a"/>
    </symbol>
    <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12z" fill="currentColor"/></symbol>
    <symbol id="i-rocket" viewBox="0 0 48 48">
      <path d="M24 2c9 7 12 17 10 29H14C12 19 15 9 24 2z" fill="#f7f4ff" stroke="#2a1470" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M14 26l-8 9 9 1zM34 26l8 9-9 1z" fill="#7c4dff" stroke="#2a1470" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="24" cy="18" r="5" fill="#6fe6ff" stroke="#2a1470" stroke-width="2.5"/>
      <path class="flame" d="M18 33c0 6 3 9 6 13 3-4 6-7 6-13z" fill="url(#g-gold)" stroke="#7a2f0a" stroke-width="2" stroke-linejoin="round"/>
    </symbol>
  </defs>
</svg>`;

function header(p) {
  const links = [
    ['about', 'ค่ายนี้คืออะไร'],
    ['build', 'สิ่งที่จะได้ทำ'],
    ...(c.showcase ? [['showcase', 'ผลงานเพื่อน ๆ']] : []),
    ['missions', 'ภารกิจ 4 วัน'],
    ['faq', 'FAQ'],
    ['home', 'กลับหน้าแรก'],
  ];
  return `
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${p.home}#top" aria-label="${e(c.camp.name)} โดย ${e(c.camp.organizer)} — กลับด้านบน">
      ${logoImg(p.root, 'brand-logo', true)}
      <span class="brand-by">by ${e(c.camp.organizer)}</span>
    </a>
    <nav id="site-nav" class="site-nav" aria-label="เมนูหลัก">
      <ul>
        ${links.map(([id, t]) => id === 'home'
          ? `<li><a class="nav-home" href="${onHost ? '/' : `${p.home}#top`}"${onHost ? ' target="_top"' : ''}>${t}</a></li>`
          : `<li><a href="${p.home}#${id}">${t}</a></li>`).join('')}
      </ul>
    </nav>
    ${p.cta === false ? '' : registerLink(p, 'btn btn-primary btn-sm header-cta')}
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="menu-icon" aria-hidden="true"></span><span class="sr-only">เมนู</span>
    </button>
  </div>
</header>`;
}

// ฝังในเว็บหลัก: ฟอร์มสมัครเป็นของ host จึงลิงก์ไปนโยบายของ host (ถ้าตั้งไว้) แทนหน้าร่างในชุดนี้
function privacyLink(p) {
  if (host) return c.privacy.url ? `<li><a href="${e(c.privacy.url)}" target="_blank" rel="noopener">ความเป็นส่วนตัว</a></li>` : '';
  return preview || c.privacy.confirmed ? `<li><a href="${p.privacy}">ความเป็นส่วนตัว</a></li>` : '';
}

function footer(p) {
  const links = c.contact.links;
  const privacy = privacyLink(p);
  return `
<footer class="site-footer">
  <div class="wrap footer-row">
    <div>
      ${logoImg(p.root, 'footer-logo')}
      <p class="muted">${e(c.camp.subhead)}</p>
    </div>
    <div>
      <h2 class="footer-h">ติดต่อผู้จัด</h2>
      ${links.length
        ? `<ul class="plain">${links.map(l => `<li><a href="${e(l.href)}"${ext(l.href)}>${e(l.label)}</a></li>`).join('')}</ul>`
        : `<p>${pend('รอยืนยันช่องทางติดต่อ')}</p>`}
    </div>
    ${privacy ? `<div><h2 class="footer-h">ข้อมูลเพิ่มเติม</h2><ul class="plain">${privacy}</ul></div>` : ''}
  </div>
  <div class="wrap footer-base muted">© ${e(c.camp.organizer)} · ${e(c.camp.name)}</div>
</footer>`;
}

function initNav() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('site-nav');
  const setOpen = open => {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', ev => ev.target.closest('a') && setOpen(false));
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      btn.focus();
    }
  });
}

// ปุ่มสมัครในหน้าที่ถูกฝัง: ให้เว็บหลักเปิดฟอร์มสมัครของตัวเอง
function initBridge() {
  if (!embedded || !onHost) return;
  document.addEventListener('click', ev => {
    if (!ev.target.closest?.('a[data-register]')) return;
    ev.preventDefault();
    window.parent.postMessage({ type: 'hh-superdev:register' }, location.origin);
  }, true);
}

// paths: { root, home, register, privacy, cta? } เป็น path สัมพัทธ์จากหน้าปัจจุบัน (cta: false = ไม่แสดงปุ่มสมัครบน header)
export function mount(paths, mainHtml, after = '') {
  document.body.innerHTML = `
${SPRITES}
<a class="skip" href="#main">ข้ามไปยังเนื้อหา</a>
<div class="page">
${header(paths)}
<main id="main" tabindex="-1">${mainHtml}</main>
${footer(paths)}
</div>
${after}`;
  initNav();
  initBridge();
  // เนื้อหาถูกสร้างหลังโหลดหน้า จึงต้องเลื่อนไปยัง anchor เอง (และอีกครั้งเมื่อฟอนต์/รูปโหลดครบ)
  if (location.hash.length > 1) {
    history.scrollRestoration = 'manual';
    const go = () => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
    go();
    addEventListener('load', go, { once: true });
    document.fonts?.ready.then(go);
  }
  // เอฟเฟกต์เป็นส่วนเสริม: โหลดแยกและไม่กระทบเนื้อหาถ้าโหลดไม่สำเร็จ
  // class "fx" ซ่อนองค์ประกอบ .reveal ไว้รอแอนิเมชัน จึงต้องถอดออกถ้า fx.js ใช้ไม่ได้
  const root = document.documentElement;
  root.classList.add('fx');
  import('./fx.js').then(m => m.initFx()).catch(() => root.classList.remove('fx'));
}
