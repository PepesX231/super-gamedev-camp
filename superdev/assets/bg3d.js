// ฉากหลัง 3D: โมเดลที่ปั้นและจัดวางใน Blender (tools/blender/build_bg.py → assets/3d/bg.json + bg.bin)
// กล้องเลื่อนลงตามการเลื่อนหน้าเว็บ ของที่อยู่ใกล้จึงเคลื่อนเร็วกว่าของไกล (มิติจริง ไม่ใช่ภาพแบน)
// รถไฟอวกาศวิ่งตามรางที่ออกจากหน้าจอคอม วนผ่านดาวทุกดวงลงไปจนสุดหน้า แล้วกลับเข้าทางหลังจอ
//
// ประสิทธิภาพ (คอม + มือถือ/iOS):
//  - รวมชิ้นส่วนของแต่ละวัตถุเป็นเมชเดียว (สี/แสงเรืองเก็บต่อจุด) หิน+ดาวทั้งหมดรวมเป็นเมชเดียว → draw call ~50 จาก ~500
//  - ความละเอียดปรับลดเองถ้าเครื่องวาดไม่ทัน, จำกัด 60fps (จอ 120Hz ไม่ต้องวาดเกิน), หยุดเมื่อแท็บถูกซ่อน
//    และไม่วาดเลยขณะที่ฉากบนสุดบังพื้นหลังทั้งจอ, วัตถุที่อยู่นอกจอไม่ถูกคำนวณ/วาด
//  - canvas สูงเท่าจอแบบเต็ม (100lvh) แถบที่อยู่เว็บของ iOS ซ่อน/โผล่จึงไม่ต้องสร้างภาพใหม่
//  - โหลดไฟล์โมเดลแบบบีบอัด (gzip) เมื่อเบราว์เซอร์รองรับ, ตำแหน่งรถไฟใช้ตารางคำนวณล่วงหน้า
// ถ้า WebGL ใช้ไม่ได้ / โหลดไฟล์ไม่ได้ / โหมดประหยัดเน็ต → ไม่แสดง (พื้นหลังดาวเดิมยังอยู่)
import { loadThree, webglOK, reduced, coarse, saveData } from './gfx.js';

const NO_OUTLINE = new Set(['ring', 'starGlow']);
const MERGED = new Set(['rock', 'star']);

async function loadBin() {
  if ('DecompressionStream' in window) {
    try {
      const r = await fetch('assets/3d/bg.bin.gz');
      if (r.ok) return await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    } catch { /* ใช้ไฟล์ไม่บีบอัดแทน */ }
  }
  return fetch('assets/3d/bg.bin').then((r) => r.arrayBuffer());
}

export async function initBg3d() {
  if (saveData || !webglOK()) return;
  let T, meta, bin;
  try {
    [T, meta, bin] = await Promise.all([loadThree(), fetch('assets/3d/bg.json').then((r) => r.json()), loadBin()]);
  } catch {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'bg3d';
  canvas.setAttribute('aria-hidden', 'true');
  (document.querySelector('.starfield') || document.body.firstElementChild).after(canvas);

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, stencil: false, powerPreference: coarse ? 'low-power' : 'default' });
  } catch {
    canvas.remove();
    return;
  }
  renderer.outputColorSpace = T.SRGBColorSpace;
  if (location.search.includes('perf')) window.__bg3d = renderer; // ?perf ดูจำนวน draw call ได้
  const minPR = coarse ? 0.6 : 0.75;
  let pr = Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.5);

  const scene = new T.Scene();
  scene.fog = new T.Fog(0x0c0632, 17, 46);
  const camera = new T.PerspectiveCamera(40, 1, 0.5, 120);
  scene.add(new T.HemisphereLight(0xc9b8ff, 0x1a0d4a, 1.6));
  const key = new T.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 9, 12);
  const rim = new T.DirectionalLight(0x6fe6ff, 1.6);
  rim.position.set(-9, -3, -6);
  scene.add(key, rim);

  // ── วัสดุ: toon 3 ระดับ ใช้สีต่อจุด + แสงเรืองต่อจุด (วัสดุเดียวทั้งฉาก) ──
  const ramp = new T.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, T.RedFormat);
  ramp.minFilter = ramp.magFilter = T.NearestFilter;
  ramp.needsUpdate = true;
  const toon = new T.MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
  toon.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute float emi;\nvarying float vEmi;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvEmi = emi;');
    sh.fragmentShader = 'varying float vEmi;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance = vColor.rgb * vEmi;');
  };
  const outlineMat = new T.MeshBasicMaterial({ color: 0x150a36, side: T.BackSide });
  outlineMat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute vec3 hn;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + hn * 0.04;');
  };
  const portalMat = new T.ShaderMaterial({
    uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `precision mediump float; uniform float t; varying vec2 vP;
      void main(){
        vec2 p = (vP - vec2(0.0, 0.15)) / vec2(1.25, 0.95);
        float r = length(p), a = atan(p.y, p.x);
        float s = sin(a * 3.0 + r * 11.0 - t * 3.2);
        vec3 c = mix(vec3(0.10, 0.04, 0.36), vec3(0.62, 0.36, 1.0), 0.5 + 0.5 * s);
        c = mix(c, vec3(0.5, 0.95, 1.0), smoothstep(0.45, 0.0, r) * (0.7 + 0.3 * sin(t * 2.0)));
        c *= smoothstep(1.35, 0.55, r) + 0.2;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });

  // ── ถอดรหัสเมชบีบอัดจาก Blender (ทำครั้งเดียว) ──
  const decode = (p) => {
    const n = p.n, q = new Uint16Array(bin, p.po, n * 3), nn = new Int8Array(bin, p.no, n * 3);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), hn = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) {
      const a = i % 3;
      pos[i] = p.lo[a] + (q[i] / 65535) * (p.hi[a] - p.lo[a]);
      nor[i] = nn[i] / 127;
    }
    if (!NO_OUTLINE.has(p.mat)) {
      // เส้นขอบการ์ตูน: เฉลี่ยนอร์มอลของจุดที่ซ้อนกัน เพื่อไม่ให้ขอบแตกตรงมุมคม (ไม่มีเส้นขอบ → hn = 0)
      const acc = new Map(), keyOf = (v) => q[v * 3] * 4294967296 + q[v * 3 + 1] * 65536 + q[v * 3 + 2];
      const sum = new Float32Array(n * 3);
      for (let v = 0; v < n; v++) {
        const k = keyOf(v);
        let s = acc.get(k);
        if (s === undefined) { s = v * 3; acc.set(k, s); }
        sum[s] += nor[v * 3]; sum[s + 1] += nor[v * 3 + 1]; sum[s + 2] += nor[v * 3 + 2];
      }
      for (let v = 0; v < n; v++) {
        const s = acc.get(keyOf(v));
        const l = Math.hypot(sum[s], sum[s + 1], sum[s + 2]) || 1;
        hn[v * 3] = sum[s] / l; hn[v * 3 + 1] = sum[s + 1] / l; hn[v * 3 + 2] = sum[s + 2] / l;
      }
    }
    const m = meta.materials[p.mat];
    return { n, pos, nor, hn, idx: new Uint16Array(bin, p.io, p.i), col: new T.Color(m.color), emi: (m.e || 0) * 0.85, portal: p.mat === 'portal' };
  };

  // รวมหลายชิ้นเป็นเมชเดียว (ใส่ matrix เพื่อย้ายชิ้นเข้าพิกัดเดียวกันได้)
  const v3 = new T.Vector3(), nm = new T.Matrix3();
  const merge = (list) => {
    let nv = 0, ni = 0;
    for (const { d } of list) { nv += d.n; ni += d.idx.length; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), hn = new Float32Array(nv * 3);
    const col = new Float32Array(nv * 3), emi = new Float32Array(nv);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const { d, m } of list) {
      if (m) {
        nm.getNormalMatrix(m);
        for (let v = 0; v < d.n; v++) {
          const o = (vo + v) * 3, s = v * 3;
          v3.fromArray(d.pos, s).applyMatrix4(m).toArray(pos, o);
          v3.fromArray(d.nor, s).applyMatrix3(nm).normalize().toArray(nor, o);
          v3.fromArray(d.hn, s).applyMatrix3(nm).toArray(hn, o);
        }
      } else {
        pos.set(d.pos, vo * 3); nor.set(d.nor, vo * 3); hn.set(d.hn, vo * 3);
      }
      for (let v = 0; v < d.n; v++) {
        const o = (vo + v) * 3;
        col[o] = d.col.r; col[o + 1] = d.col.g; col[o + 2] = d.col.b;
        emi[vo + v] = d.emi;
      }
      for (let i = 0; i < d.idx.length; i++) idx[io + i] = d.idx[i] + vo;
      vo += d.n; io += d.idx.length;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));
    g.setAttribute('hn', new T.BufferAttribute(hn, 3));
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.setAttribute('emi', new T.BufferAttribute(emi, 1));
    g.setIndex(new T.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    return g;
  };
  const withOutline = (parent, g) => {
    parent.add(new T.Mesh(g, toon));
    parent.add(new T.Mesh(g, outlineMat));
  };
  const build = (grp) => {
    const inner = new T.Group();
    const ds = grp.parts.map(decode);
    const solid = ds.filter((d) => !d.portal);
    if (solid.length) withOutline(inner, merge(solid.map((d) => ({ d }))));
    for (const d of ds.filter((x) => x.portal)) {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(d.pos, 3));
      g.setIndex(new T.BufferAttribute(d.idx.slice(), 1));
      inner.add(new T.Mesh(g, portalMat));
    }
    return inner;
  };

  // ── วางวัตถุตามตำแหน่งที่จัดไว้ใน Blender ──
  const items = [], loose = [];
  let locoT, carT;
  for (const grp of meta.groups) {
    if (grp.kind === 'train-loco') { locoT = build(grp); continue; }
    if (grp.kind === 'train-car') { carT = build(grp); continue; }
    if (MERGED.has(grp.kind)) { loose.push({ m: new T.Matrix4().fromArray(grp.m), ds: grp.parts.map(decode) }); continue; }
    const outer = new T.Group();
    new T.Matrix4().fromArray(grp.m).decompose(outer.position, outer.quaternion, outer.scale);
    outer.add(build(grp));
    scene.add(outer);
    items.push({ outer, inner: outer.children[0], kind: grp.kind, spin: grp.spin, bob: grp.bob, ph: items.length * 1.7, x0: outer.position.x, y0: outer.position.y });
  }
  bin = null;

  // หินและดาวทั้งหมด → เมชเดียว (สร้างใหม่เฉพาะตอนสัดส่วนจอเปลี่ยนมาก)
  let kx = 1;
  const debris = new T.Group();
  scene.add(debris);
  const makeDebris = () => {
    for (const c of debris.children) c.geometry.dispose();
    debris.clear();
    const list = [];
    for (const it of loose) {
      const m = it.m.clone();
      m.elements[12] *= kx;
      for (const d of it.ds) list.push({ d, m });
    }
    withOutline(debris, merge(list));
  };

  // ── รางและขบวนรถไฟ (ตำแหน่งบนรางคำนวณล่วงหน้าเป็นตาราง ไม่ต้องคำนวณเส้นโค้งทุกเฟรม) ──
  const base = meta.path.map(([x, y, z]) => new T.Vector3(x, y, z));
  const railMat = (color, opacity) => new T.MeshBasicMaterial({ color, transparent: true, opacity, blending: T.AdditiveBlending, depthWrite: false });
  const railMatA = railMat(0x8ff0ff, 0.38), railMatB = railMat(0x9a7bff, 0.07);
  const LUT_N = 2400;
  let rails = [], lut, lutLen = 1;
  const makeRail = () => {
    const curve = new T.CatmullRomCurve3(base.map((v) => new T.Vector3(v.x * kx, v.y, v.z)), true);
    for (const r of rails) { scene.remove(r); r.geometry.dispose(); }
    rails = [new T.Mesh(new T.TubeGeometry(curve, coarse ? 600 : 900, 0.035, 4, true), railMatA),
      new T.Mesh(new T.TubeGeometry(curve, 360, 0.16, 5, true), railMatB)];
    scene.add(...rails);
    lut = new Float32Array((LUT_N + 1) * 3);
    curve.getSpacedPoints(LUT_N).forEach((p, i) => p.toArray(lut, i * 3));
    lutLen = curve.getLength();
  };
  const trains = [0, 0.5].map((off) => {
    const cars = [locoT, carT, carT, carT].map((t) => t.clone());
    cars.forEach((c) => { c.scale.setScalar(0.78); scene.add(c); });
    return { off, cars, gaps: [0, 2.2, 4.2, 6.2] };
  });
  const at = (u, out) => {
    const f = (((u % 1) + 1) % 1) * LUT_N, i = Math.min(LUT_N - 1, Math.floor(f)), k = f - i, a = i * 3, b = a + 3;
    return out.set(lut[a] + (lut[b] - lut[a]) * k, lut[a + 1] + (lut[b + 1] - lut[a + 1]) * k, lut[a + 2] + (lut[b + 2] - lut[a + 2]) * k);
  };
  const ahead = new T.Vector3();
  const placeTrains = (t, top, bottom) => {
    for (const tr of trains) {
      const head = (t * 4.2) / lutLen + tr.off;
      tr.cars.forEach((c, i) => {
        const u = head - tr.gaps[i] / lutLen;
        at(u, c.position);
        c.visible = c.position.y < top && c.position.y > bottom;
        if (c.visible) c.lookAt(at(u + 0.6 / lutLen, ahead));
      });
    }
  };

  // ── ขนาดจอ ──
  let W = 0, H = 0, heroEnd = 0, ext = 12;
  const hero = document.querySelector('.hero');
  const measure = () => { heroEnd = hero ? hero.offsetTop + hero.offsetHeight : 0; };
  const applySize = () => {
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
  };
  const resize = (force) => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    measure();
    if (!force && w === W && h === H) return;
    W = w; H = h;
    const aspect = W / H;
    camera.aspect = aspect;
    const halfW = Math.max(12 * Math.min(1, aspect / 1.6), 5.6);
    camera.fov = (2 * Math.atan(halfW / aspect / 16) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    ext = 16 * Math.tan((camera.fov * Math.PI) / 360) * 2.5 + 3; // ครึ่งความสูงที่มองเห็นได้ถึงของชั้นลึกสุด
    applySize();
    const nk = Math.min(1, Math.max(0.46, aspect / 1.6)); // จอแคบ: ดึงของเข้ามาให้ยังเห็น
    if (force || Math.abs(nk - kx) > 0.02) {
      kx = nk;
      for (const it of items) it.outer.position.x = it.x0 * kx;
      makeRail();
      makeDebris();
    }
  };
  resize(true);
  let resizeT;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => resize(false), 150); }, { passive: true });
  addEventListener('load', measure, { once: true });

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (!coarse) addEventListener('pointermove', (e) => { tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; }, { passive: true });
  // ความยาวหน้าเว็บอ่านเฉพาะตอนจำเป็น (ไม่บังคับคำนวณ layout ทุกเฟรม)
  let maxScroll = 1;
  const readMax = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  readMax();
  addEventListener('load', readMax, { once: true });
  addEventListener('resize', readMax, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(readMax).observe(document.body);
  const target = () => -Math.min(1, scrollY / maxScroll) * meta.col;
  let camY = target();

  const frame = (t) => {
    portalMat.uniforms.t.value = t;
    camY += (target() - camY) * (reduced ? 1 : 0.14);
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    camera.position.set(mx * 1.6, camY - my, 16);
    camera.lookAt(mx * 0.6, camY, 0);
    const top = camY + ext, bottom = camY - ext;
    for (const it of items) {
      const y = it.y0;
      it.outer.visible = y < top && y > bottom; // อยู่นอกจอ ไม่ต้องคำนวณ/วาด
      if (!it.outer.visible || it.kind === 'portal') continue;
      it.inner.rotation.y = Math.sin(t * 0.5 + it.ph) * 0.35 * (it.spin / 0.25);
      it.inner.rotation.z = Math.sin(t * 0.37 + it.ph) * 0.06;
      it.outer.position.y = y + Math.sin(t * 0.8 + it.ph) * it.bob * 2;
    }
    placeTrains(t, top, bottom);
    renderer.render(scene, camera);
  };

  // หยุดเมื่อ context หลุด (iOS ทำเมื่อสลับแอปนาน ๆ)
  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; }, false);
  canvas.addEventListener('webglcontextrestored', () => { lost = false; }, false);

  canvas.classList.add('on');
  const covered = () => scrollY + innerHeight < heroEnd - 2; // ฉากบนสุดยังบังพื้นหลังทั้งจอ
  if (reduced) {
    const still = () => { if (!lost && !covered()) frame(6); };
    still();
    addEventListener('scroll', () => requestAnimationFrame(still), { passive: true });
    addEventListener('resize', () => setTimeout(still, 200), { passive: true });
    return;
  }

  // ── วนวาด: จำกัด ~60fps + ลดความละเอียดเองถ้าเครื่องวาดไม่ทัน ──
  let minDt = 1000 / 64, last = 0, slow = 0, n = 0, sum = 0;
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (lost || document.hidden || covered()) { last = 0; return; }
    const dt = now - last;
    if (last && dt < minDt) return;
    if (last && dt < 250) {
      sum += dt;
      if (++n === 45) {
        const avg = sum / n;
        if (avg > 23 && pr > minPR) { pr = Math.max(minPR, pr * 0.8); applySize(); }
        else if (avg > 23 && ++slow >= 2) minDt = 1000 / 31; // เครื่องช้ามาก: 30fps
        n = 0; sum = 0;
      }
    }
    last = now;
    frame(now / 1000);
  };
  requestAnimationFrame(loop);
}
