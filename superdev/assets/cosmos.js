// ของตกแต่งอวกาศ: อุปกรณ์คอมที่ลอย/ร่วงผ่านอวกาศ (แทนดาวตก), UFO, กาแล็กซี และหลุมดำ
// วาดเป็น SVG ล้วน ขยับด้วย transform/opacity เท่านั้น และหยุดเองเมื่อเลื่อนพ้นจอ (.is-off)

const INK = '#14063f';

// ── อุปกรณ์ (viewBox 64×64) ─────────────────────────────────────────────
const GEAR = {
  laptop: `
    <path d="M12 12h40a3 3 0 0 1 3 3v27H9V15a3 3 0 0 1 3-3z" fill="#3a22a8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="13" y="16" width="38" height="22" rx="2" fill="#1b0f5c"/>
    <path d="M17 21h12M17 26h20M21 31h14" stroke="#6fe6ff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M17 31h1" stroke="#ffd23f" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M4 42h56l-4 8H8z" fill="#d9d2ff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M26 45h12" stroke="#8f80d9" stroke-width="2.4" stroke-linecap="round"/>`,
  mouse: `
    <path d="M32 6c0 0 4 3 2 9" fill="none" stroke="#b9a2ff" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="18" y="14" width="28" height="42" rx="14" fill="#f7f4ff" stroke="${INK}" stroke-width="2.5"/>
    <path d="M18 31h28M32 14v17" stroke="${INK}" stroke-width="2.2"/>
    <rect x="29.5" y="19" width="5" height="8" rx="2.5" fill="#7c4dff"/>
    <path d="M22 46c4 4 16 4 20 0" fill="none" stroke="#ff8fb8" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`,
  monitor: `
    <rect x="6" y="8" width="52" height="36" rx="4" fill="#2a1680" stroke="${INK}" stroke-width="2.5"/>
    <rect x="10" y="12" width="44" height="26" rx="2" fill="#4f7dff"/>
    <path d="M10 30l10-8 8 6 10-10 16 12v8H10z" fill="#6fe6ff" opacity=".85"/>
    <circle cx="44" cy="19" r="3.5" fill="#ffd23f"/>
    <path d="M27 44h10l2 9H25z" fill="#b9a2ff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M18 54h28" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  gamepad: `
    <path d="M18 20h28c8 0 12 6 13 14l1 10c1 7-6 10-10 5l-5-6H19l-5 6c-4 5-11 2-10-5l1-10c1-8 5-14 13-14z" fill="#f7f4ff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M19 29v10M14 34h10" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="44" cy="30" r="2.8" fill="#ff8fb8"/><circle cx="50" cy="35" r="2.8" fill="#6fe6ff"/>
    <circle cx="44" cy="40" r="2.8" fill="#ffd23f"/><circle cx="38" cy="35" r="2.8" fill="#7c4dff"/>`,
  keyboard: `
    <rect x="4" y="18" width="56" height="28" rx="4" fill="#d9d2ff" stroke="${INK}" stroke-width="2.5"/>
    <g fill="#6a5cb8"><rect x="9" y="23" width="6" height="5" rx="1"/><rect x="17" y="23" width="6" height="5" rx="1"/><rect x="25" y="23" width="6" height="5" rx="1"/><rect x="33" y="23" width="6" height="5" rx="1"/><rect x="41" y="23" width="6" height="5" rx="1"/><rect x="49" y="23" width="6" height="5" rx="1"/>
    <rect x="9" y="30" width="6" height="5" rx="1"/><rect x="17" y="30" width="6" height="5" rx="1"/><rect x="25" y="30" width="6" height="5" rx="1"/><rect x="33" y="30" width="6" height="5" rx="1"/><rect x="41" y="30" width="14" height="5" rx="1"/></g>
    <rect x="17" y="37" width="30" height="5" rx="1.5" fill="#7c4dff"/>`,
  cd: `
    <circle cx="32" cy="32" r="24" fill="#d9d2ff" stroke="${INK}" stroke-width="2.5"/>
    <path d="M32 8a24 24 0 0 1 22 15L32 32z" fill="#6fe6ff" opacity=".7"/>
    <path d="M10 41a24 24 0 0 0 13 13l9-22z" fill="#ff8fb8" opacity=".7"/>
    <circle cx="32" cy="32" r="7" fill="#1b0f5c" stroke="${INK}" stroke-width="2.5"/>`,
};

const UFO = `
<svg viewBox="0 0 120 110" aria-hidden="true">
  <defs>
    <linearGradient id="ufo-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff3ff" stop-opacity=".7"/><stop offset="1" stop-color="#9ff3ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="ufo-dome" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#e6fdff"/><stop offset=".6" stop-color="#6fe6ff" stop-opacity=".8"/><stop offset="1" stop-color="#3a8fd0" stop-opacity=".7"/></radialGradient>
  </defs>
  <path class="ufo-beam" d="M46 52h28l22 58H24z" fill="url(#ufo-beam)"/>
  <path d="M38 36a22 20 0 0 1 44 0z" fill="url(#ufo-dome)" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="60" cy="30" r="6" fill="#7dd87a" stroke="${INK}" stroke-width="2"/><circle cx="58" cy="29" r="1.6" fill="${INK}"/><circle cx="62.5" cy="29" r="1.6" fill="${INK}"/>
  <ellipse cx="60" cy="42" rx="52" ry="13" fill="#b9a2ff" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="60" cy="38" rx="40" ry="6" fill="#ded4ff"/>
  <g class="ufo-lights"><circle cx="24" cy="44" r="3.5" fill="#ffd23f"/><circle cx="42" cy="48" r="3.5" fill="#ff8fb8"/><circle cx="60" cy="49.5" r="3.5" fill="#ffd23f"/><circle cx="78" cy="48" r="3.5" fill="#ff8fb8"/><circle cx="96" cy="44" r="3.5" fill="#ffd23f"/></g>
</svg>`;

const gearSvg = kind => `<svg viewBox="0 0 64 64" aria-hidden="true">${GEAR[kind] ?? GEAR.laptop}</svg>`;

// mode 'fall' = ร่วงผ่านจอเป็นรอบ ๆ พร้อมหางแสง, 'drift' = ลอยนิ่งในตำแหน่ง (หางแสงคงที่)
// x/y = % ของกล่องที่วาง, s = ขนาด, a = มุมทิศทาง (องศา, 0 = ไปทางขวา ตามเข็ม), c = สีหางแสง
export function gear({ kind, x, y, s = 56, a = 130, c = 'var(--cyan)', dur = 12, delay = 0, spin = 200, mode = 'fall', cls = '' }) {
  return `<span class="gear gear--${mode} ${cls}" style="left:${x}%;top:${y}%;--s:${s}px;--a:${a}deg;--c:${c};--dur:${dur}s;--delay:${-delay}s;--spin:${spin}deg">` +
    `<span class="gear-move"><i class="gear-trail"></i><span class="gear-body">${gearSvg(kind)}</span></span></span>`;
}

export function ufo({ x, y, s = 120, dur = 22, delay = 0, cls = '' }) {
  return `<span class="ufo ${cls}" style="left:${x}%;top:${y}%;--s:${s}px;--dur:${dur}s;--delay:${-delay}s"><span class="ufo-body">${UFO}</span></span>`;
}

// ── กาแล็กซีกังหัน (สร้างจุดดาวแบบกำหนดผลลัพธ์ได้ ทุกครั้งออกมาเหมือนเดิม) ──
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function galaxy(seed = 7, tint = '#9b7bff') {
  const rand = rng(seed);
  const dots = [], arms = [];
  for (let arm = 0; arm < 2; arm++) {
    const pts = [];
    for (let i = 0; i < 320; i++) {
      const t = i / 320;
      const ang = arm * Math.PI + t * Math.PI * 2.4;
      const r = 8 + t * 86;
      if (i % 8 === 0) pts.push(`${(100 + Math.cos(ang) * r).toFixed(1)},${(100 + Math.sin(ang) * r).toFixed(1)}`);
      const spread = 2.5 + t * 9;
      const x = 100 + Math.cos(ang) * r + (rand() - 0.5) * spread;
      const y = 100 + Math.sin(ang) * r + (rand() - 0.5) * spread;
      const size = (rand() * 0.8 + 0.25) * (1.15 - t * 0.5);
      const pick = rand();
      const col = t < 0.2 && pick < 0.6 ? '#ffe2b0' : pick < 0.06 ? '#ff9ac4' : pick < 0.3 ? '#bfe3ff' : '#ffffff';
      dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(2)}" fill="${col}" opacity="${(0.3 + rand() * 0.6).toFixed(2)}"/>`);
    }
    arms.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${tint}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".32"/>`);
  }
  for (let i = 0; i < 90; i++) {
    const ang = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 92;
    dots.push(`<circle cx="${(100 + Math.cos(ang) * r).toFixed(1)}" cy="${(100 + Math.sin(ang) * r).toFixed(1)}" r="${(rand() * 0.5 + 0.2).toFixed(2)}" fill="#fff" opacity="${(rand() * 0.45 + 0.15).toFixed(2)}"/>`);
  }
  return `
<svg viewBox="0 0 200 200" class="galaxy-svg" aria-hidden="true">
  <defs>
    <radialGradient id="gx-core-${seed}"><stop offset="0" stop-color="#fffaf0"/><stop offset=".16" stop-color="#ffe2a8" stop-opacity=".95"/><stop offset=".45" stop-color="#c79cff" stop-opacity=".35"/><stop offset="1" stop-color="#7c4dff" stop-opacity="0"/></radialGradient>
    <radialGradient id="gx-haze-${seed}"><stop offset="0" stop-color="${tint}" stop-opacity=".3"/><stop offset=".7" stop-color="#4f7dff" stop-opacity=".08"/><stop offset="1" stop-color="#4f7dff" stop-opacity="0"/></radialGradient>
    <filter id="gx-blur-${seed}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <circle cx="100" cy="100" r="98" fill="url(#gx-haze-${seed})"/>
  <g class="galaxy-spin"><g filter="url(#gx-blur-${seed})">${arms.join('')}</g>${dots.join('')}</g>
  <circle cx="100" cy="100" r="30" fill="url(#gx-core-${seed})"/>
</svg>`;
}

// ── หลุมดำ: วงแหวนเรืองแสง (accretion disk) ด้านหลัง + เงาดำ + ครึ่งหน้าของวงแหวนทับด้านหน้า ──
export function blackHole(id = 'bh') {
  return `
<svg viewBox="0 0 300 200" class="bh-svg" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-disk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a1f" stop-opacity="0"/><stop offset=".22" stop-color="#ff8a1f"/><stop offset=".5" stop-color="#fff1c2"/><stop offset=".78" stop-color="#ff6fa6"/><stop offset="1" stop-color="#7c4dff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}-glow"><stop offset=".3" stop-color="#ffb35c" stop-opacity=".45"/><stop offset=".6" stop-color="#b04ad6" stop-opacity=".2"/><stop offset="1" stop-color="#7c4dff" stop-opacity="0"/></radialGradient>
    <filter id="${id}-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="150" cy="100" rx="150" ry="100" fill="url(#${id}-glow)"/>
  <g class="bh-swirl">
    <ellipse cx="150" cy="100" rx="120" ry="26" fill="none" stroke="url(#${id}-disk)" stroke-width="16" filter="url(#${id}-blur)" opacity=".85"/>
  </g>
  <path d="M92 100a58 56 0 0 1 116 0" fill="none" stroke="url(#${id}-disk)" stroke-width="10" filter="url(#${id}-blur)" opacity=".9"/>
  <path d="M96 100a54 52 0 0 1 108 0" fill="none" stroke="#fff3d6" stroke-width="1.6" opacity=".75"/>
  <circle cx="150" cy="100" r="42" fill="#020008"/>
  <path d="M112 104a38 16 0 0 0 76 0" fill="none" stroke="#ffcf8a" stroke-width="2" opacity=".55"/>
  <circle cx="150" cy="100" r="43.5" fill="none" stroke="#ffe7b0" stroke-width="1.6" opacity=".9"/>
  <path d="M30 104a120 26 0 0 0 240 0" fill="none" stroke="url(#${id}-disk)" stroke-width="9" stroke-linecap="round"/>
  <path d="M46 106a104 20 0 0 0 208 0" fill="none" stroke="#fff6dc" stroke-width="2" stroke-linecap="round" opacity=".8"/>
</svg>`;
}

// ── ชิ้นฉากหลังที่วางไว้ในแต่ละ section (ตำแหน่ง/ขนาดกำหนดใน CSS ด้วย class) ──
export const space = (kind, cls) =>
  `<div class="cz ${cls}" aria-hidden="true">${kind === 'galaxy' ? galaxy(cls.length * 7 + 3) : kind === 'hole' ? blackHole(cls) : ''}</div>`;

// ── ของร่วงเป็นฉากหลังทั้งหน้า: โน้ตบุ๊ก เมาส์ จอ จอยเกม ฯลฯ ร่วงผ่านจอเป็นระยะ + UFO บินผ่าน ──
// วางแบบ fixed ไว้หลังเนื้อหา ขยับด้วย transform เท่านั้น
export function skyfall() {
  const items = [
    { kind: 'laptop', x: 18, y: -12, s: 58, a: 112, c: 'var(--cyan)', dur: 19, delay: 2 },
    { kind: 'mouse', x: 52, y: -12, s: 36, a: 104, c: 'var(--pink)', dur: 16, delay: 9, spin: -280 },
    { kind: 'gamepad', x: 84, y: -12, s: 50, a: 122, c: 'var(--gold)', dur: 22, delay: 5 },
    { kind: 'monitor', x: 104, y: 14, s: 52, a: 150, c: 'var(--violet-hi)', dur: 24, delay: 14, spin: 160 },
    { kind: 'keyboard', x: 34, y: -12, s: 54, a: 98, c: 'var(--cyan)', dur: 26, delay: 18, spin: 120, cls: 'gear-wide' },
    { kind: 'cd', x: 70, y: -12, s: 34, a: 116, c: 'var(--pink)', dur: 18, delay: 12, spin: 420, cls: 'gear-wide' },
  ];
  return `<div class="skyfall" aria-hidden="true">${items.map(gear).join('')}${ufo({ x: -16, y: 38, s: 104, dur: 34, delay: 20 })}</div>`;
}

// ── ท้องฟ้าจักรวาล: วาดลง canvas ครั้งเดียว (และเมื่อเปลี่ยนขนาดจอ) — เนบิวลาสีน้ำเงิน/ม่วง ฝุ่นอวกาศ และดาวหนาแน่น ──
export function paintStarfield() {
  const cv = document.createElement('canvas');
  cv.className = 'starfield';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = innerWidth, h = innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rand = rng(20261009);
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#04020f'); bg.addColorStop(0.5, '#070521'); bg.addColorStop(1, '#0a041c');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const blob = (x, y, r, col, a) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, col.replace('A', a)); rg.addColorStop(1, col.replace('A', 0));
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    };
    // แถบเนบิวลาพาดเฉียง (คล้ายทางช้างเผือก)
    g.globalCompositeOperation = 'lighter';
    const band = t => ({ x: t * w * 1.2 - w * 0.1, y: h * 0.85 - t * h * 0.7 });
    for (let i = 0; i < 70; i++) {
      const t = rand(), p = band(t), off = (rand() - 0.5) * h * 0.45;
      const r = (0.12 + rand() * 0.22) * Math.max(w, h);
      const pick = rand();
      const col = pick < 0.55 ? 'rgba(60,100,255,A)' : pick < 0.85 ? 'rgba(120,80,255,A)' : 'rgba(255,100,170,A)';
      blob(p.x + off * 0.4, p.y + off, r, col, 0.025 + rand() * 0.04);
    }
    for (let i = 0; i < 26; i++) blob(rand() * w, rand() * h, (0.04 + rand() * 0.08) * w, 'rgba(150,180,255,A)', 0.03 + rand() * 0.04);
    // ฝุ่นมืดตัดผ่านเนบิวลา
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 26; i++) {
      const p = band(rand()), off = (rand() - 0.5) * h * 0.2;
      blob(p.x, p.y + off, (0.03 + rand() * 0.07) * w, 'rgba(4,2,14,A)', 0.25 + rand() * 0.25);
    }
    // ดาว: หนาแน่นขึ้นในแถบเนบิวลา
    g.globalCompositeOperation = 'lighter';
    const n = Math.round((w * h) / 900);
    for (let i = 0; i < n; i++) {
      let x, y;
      if (rand() < 0.45) { const p = band(rand()); x = p.x + (rand() - 0.5) * h * 0.35; y = p.y + (rand() - 0.5) * h * 0.35; }
      else { x = rand() * w; y = rand() * h; }
      const m = rand();
      const r = m < 0.93 ? 0.2 + rand() * 0.55 : m < 0.995 ? 0.7 + rand() * 0.6 : 1.4 + rand() * 0.9;
      const tint = rand();
      const col = tint < 0.6 ? '255,255,255' : tint < 0.85 ? '190,210,255' : '255,214,170';
      g.fillStyle = `rgba(${col},${(0.25 + rand() * 0.6).toFixed(2)})`;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      if (r > 1.4) {
        blob(x, y, r * 6, `rgba(${col},A)`, 0.25);
        g.strokeStyle = `rgba(${col},0.4)`; g.lineWidth = 0.6;
        g.beginPath(); g.moveTo(x - r * 6, y); g.lineTo(x + r * 6, y); g.moveTo(x, y - r * 6); g.lineTo(x, y + r * 6); g.stroke();
      }
    }
    g.globalCompositeOperation = 'source-over';
  };
  draw();
  // มือถือเปลี่ยนความสูงจอทุกครั้งที่แถบที่อยู่เว็บซ่อน/โผล่ จึงวาดใหม่เฉพาะเมื่อขนาดเปลี่ยนจริง
  let t, lw = innerWidth, lh = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lw && Math.abs(innerHeight - lh) < 140) return;
    lw = innerWidth; lh = innerHeight;
    clearTimeout(t); t = setTimeout(draw, 250);
  }, { passive: true });
}
