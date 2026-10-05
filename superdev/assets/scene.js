// ฉากอวกาศของส่วนบนสุด — วาดด้วย SVG/CSS ล้วน ไม่ใช้ WebGL
import { gear, ufo } from './cosmos.js';

// ทุกชิ้นขยับด้วย transform/opacity เท่านั้น และหยุดเองเมื่อเลื่อนพ้นจอ (ดู .is-off ใน CSS)

const ROCK = ['#a495ee', '#6a5cb8', '#4a3d92']; // ด้านบน / ซ้าย / ขวา
const GROUND = ['#6453dc', '#2c1c92', '#1c1068'];

const cube = (x, y, s, [top, left, right]) =>
  `<path d="M${x} ${y}l${s} ${-s / 2}l${s} ${s / 2}l${-s} ${s / 2}z" fill="${top}"/>` +
  `<path d="M${x} ${y}l${s} ${s / 2}v${s}l${-s} ${-s / 2}z" fill="${left}"/>` +
  `<path d="M${x + s} ${y + s / 2}l${s} ${-s / 2}v${s}l${-s} ${s / 2}z" fill="${right}"/>`;

// กองลูกบาศก์แบบ isometric จากพิกัดกริด [i, j, k] (k = ความสูง)
function voxels(cells, palette, s = 20) {
  const pts = cells
    .map(([i, j, k]) => ({ x: (i - j) * s, y: ((i + j) * s) / 2 - k * s, d: i + j + k }))
    .sort((a, b) => a.d - b.d);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys) - s / 2;
  const w = Math.max(...xs) + 2 * s - x0, h = Math.max(...ys) + 1.5 * s - y0;
  return `<svg viewBox="${x0} ${y0} ${w} ${h}" width="${w}" height="${h}">${pts.map(p => cube(p.x, p.y, s, palette)).join('')}</svg>`;
}

const asteroid = `
<svg viewBox="0 0 100 92" width="100" height="92">
  <polygon points="22,30 46,8 80,16 62,40 36,44" fill="${ROCK[0]}"/>
  <polygon points="22,30 36,44 30,72 8,54" fill="${ROCK[1]}"/>
  <polygon points="36,44 62,40 74,68 48,86 30,72" fill="#7f70d0"/>
  <polygon points="62,40 80,16 95,42 74,68" fill="${ROCK[2]}"/>
</svg>`;

const ringedPlanet = `
<svg viewBox="0 0 220 160" width="220" height="160">
  <defs>
    <linearGradient id="sc-rp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc2dc"/><stop offset=".5" stop-color="#b56bff"/><stop offset="1" stop-color="#3f24c4"/></linearGradient>
    <clipPath id="sc-rpc"><circle cx="110" cy="80" r="52"/></clipPath>
  </defs>
  <g transform="rotate(-18 110 80)">
    <ellipse cx="110" cy="80" rx="100" ry="24" fill="none" stroke="#ffd9ec" stroke-opacity=".45" stroke-width="8"/>
    <circle cx="110" cy="80" r="52" fill="url(#sc-rp)"/>
    <g clip-path="url(#sc-rpc)">
      <path d="M50 54h120v8H50zM50 72h120v5H50zM50 90h120v10H50z" fill="#fff" opacity=".2"/>
      <circle cx="136" cy="104" r="62" fill="#14063f" opacity=".42"/>
    </g>
    <path d="M10 80A100 24 0 0 0 210 80" fill="none" stroke="#ffe6f2" stroke-width="8" stroke-linecap="round"/>
    <path d="M22 84A90 19 0 0 0 198 84" fill="none" stroke="#ffd23f" stroke-opacity=".8" stroke-width="2.5"/>
  </g>
</svg>`;

const moon = `
<svg viewBox="0 0 80 80" width="80" height="80">
  <defs><radialGradient id="sc-mn" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#f1ecff"/><stop offset=".6" stop-color="#a99bf0"/><stop offset="1" stop-color="#4b3ab8"/></radialGradient></defs>
  <circle cx="40" cy="40" r="36" fill="url(#sc-mn)"/>
  <g fill="#6f5fd0" opacity=".55"><circle cx="28" cy="30" r="8"/><circle cx="52" cy="50" r="10"/><circle cx="50" cy="22" r="4.5"/><circle cx="26" cy="54" r="5"/></g>
</svg>`;

const star = `<svg viewBox="0 0 64 64"><use href="#i-star"/></svg>`;
const spark = `<svg viewBox="0 0 24 24"><use href="#i-spark"/></svg>`;

// x/y เป็น % ของฉาก, w = ความกว้าง (ค่า CSS), dur/delay = จังหวะลอย
const item = (cls, x, y, w, inner, dur = 7, delay = 0) =>
  `<div class="sc-item ${cls}" style="left:${x}%;top:${y}%;width:${w};--dur:${dur}s;--delay:${-delay}s">${inner}</div>`;

export function sceneArt() {
  const terrainL = voxels([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [0, 2, 0], [1, 2, 0], [0, 3, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [2, 0, 1], [0, 0, 2], [1, 0, 2], [0, 0, 3]], GROUND, 22);
  const terrainR = voxels([[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [0, 2, 0], [0, 3, 0], [0, 0, 1], [0, 1, 1], [1, 0, 1], [0, 2, 1], [0, 0, 2], [0, 1, 2]], GROUND, 22);
  const voxelRock = voxels([[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1]], ROCK, 18);
  return `
<div class="scene" aria-hidden="true">
  <div class="sc-nebula"></div>
  <div class="sc-stars"></div>
  <div class="sc-layer" style="--k:10">
    ${item('sc-ring', 79, 9, 'clamp(120px, 16vw, 230px)', ringedPlanet, 11, 2)}
    ${item('sc-moon', 9, 13, 'clamp(48px, 6vw, 88px)', moon, 9, 4)}
    ${item('sc-far', 29, 8, 'clamp(22px, 3vw, 42px)', asteroid, 8, 1)}
    ${item('sc-far sc-flip', 66, 24, 'clamp(18px, 2.4vw, 34px)', asteroid, 10, 5)}
  </div>
  <div class="sc-flare"></div>
  <div class="sc-planet"></div>
  <div class="sc-layer" style="--k:26">
    ${item('sc-rock', 4, 42, 'clamp(64px, 9vw, 132px)', asteroid, 9, 0)}
    ${item('sc-rock sc-wide', 86, 46, 'clamp(56px, 8vw, 116px)', voxelRock, 10, 3)}
    ${item('sc-rock sc-flip sc-wide', 20, 76, 'clamp(40px, 5vw, 72px)', asteroid, 7, 2)}
  </div>
  <div class="sc-layer" style="--k:46">
    ${item('sc-gold', 16, 25, 'clamp(34px, 4.4vw, 62px)', star, 6, 1)}
    ${item('sc-gold', 81, 66, 'clamp(30px, 3.6vw, 50px)', star, 7, 3)}
    ${item('sc-gold sc-wide', 70, 12, 'clamp(22px, 2.6vw, 36px)', star, 5, 2)}
    ${[[24, 12, 0], [38, 30, 1.1], [62, 9, 0.5], [74, 38, 1.8], [10, 58, 0.8], [90, 30, 1.4], [46, 6, 2.1], [57, 70, 0.3]]
      .map(([x, y, d]) => `<div class="sc-item sc-spark" style="left:${x}%;top:${y}%;--delay:${-d}s">${spark}</div>`).join('')}
  </div>
  <div class="sc-terrain sc-terrain-l">${terrainL}</div>
  <div class="sc-terrain sc-terrain-r">${terrainR}</div>
  <div class="sc-gear">
    ${gear({ kind: 'laptop', x: 70, y: -14, s: 64, a: 128, c: 'var(--cyan)', dur: 13, delay: 1 })}
    ${gear({ kind: 'mouse', x: 38, y: -14, s: 40, a: 120, c: 'var(--pink)', dur: 11, delay: 6, spin: -260 })}
    ${gear({ kind: 'gamepad', x: 96, y: 8, s: 52, a: 140, c: 'var(--gold)', dur: 15, delay: 9.5 })}
    ${gear({ kind: 'monitor', x: 22, y: -14, s: 50, a: 112, c: 'var(--violet-hi)', dur: 17, delay: 13, spin: 160, cls: 'sc-wide' })}
    ${ufo({ x: -14, y: 20, s: 118, dur: 26, delay: 4 })}
  </div>
</div>`;
}
