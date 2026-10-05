// ฉากหลัง 3D: โมเดลที่ปั้นและจัดวางใน Blender (tools/blender/build_bg.py → assets/3d/bg.json + bg.bin)
// กล้องเลื่อนลงตามการเลื่อนหน้าเว็บ ของที่อยู่ใกล้จึงเคลื่อนเร็วกว่าของไกล (มิติจริง ไม่ใช่ภาพแบน)
// รถไฟอวกาศวิ่งตามรางที่ออกจากหน้าจอคอม วนผ่านดาวทุกดวงลงไปจนสุดหน้า แล้วกลับเข้าทางหลังจอ
// ถ้า WebGL ใช้ไม่ได้ / โหลดไฟล์ไม่ได้ / โหมดประหยัดเน็ต → ไม่แสดง (พื้นหลังดาวเดิมยังอยู่)
import { loadThree, webglOK, reduced, coarse, saveData } from './gfx.js';

const OUTLINE = 0x150a36;
const NO_OUTLINE = new Set(['ring', 'starGlow']);

export async function initBg3d() {
  if (saveData || !webglOK()) return;
  let T, meta, bin;
  try {
    [T, meta, bin] = await Promise.all([
      loadThree(),
      fetch('assets/3d/bg.json').then((r) => r.json()),
      fetch('assets/3d/bg.bin').then((r) => r.arrayBuffer()),
    ]);
  } catch {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'bg3d';
  canvas.setAttribute('aria-hidden', 'true');
  (document.querySelector('.starfield') || document.body.firstElementChild).after(canvas);

  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x0c0632, 17, 46);
  const camera = new T.PerspectiveCamera(40, 1, 0.5, 120);

  scene.add(new T.HemisphereLight(0xc9b8ff, 0x1a0d4a, 1.6));
  const key = new T.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 9, 12);
  const rim = new T.DirectionalLight(0x6fe6ff, 1.6);
  rim.position.set(-9, -3, -6);
  scene.add(key, rim);

  // ── วัสดุแบบการ์ตูน (toon 3 ระดับ) ให้เข้ากับน้องแฮมสเตอร์ 2D ──
  const ramp = new T.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, T.RedFormat);
  ramp.minFilter = ramp.magFilter = T.NearestFilter;
  ramp.needsUpdate = true;
  const clock = { t: 0 };
  const portalMat = new T.ShaderMaterial({
    uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float t; varying vec3 vP;
      void main(){
        vec2 p = (vP.xy - vec2(0.0, 0.15)) / vec2(1.25, 0.95);
        float r = length(p), a = atan(p.y, p.x);
        float s = sin(a * 3.0 + r * 11.0 - t * 3.2);
        vec3 c = mix(vec3(0.10, 0.04, 0.36), vec3(0.62, 0.36, 1.0), 0.5 + 0.5 * s);
        c = mix(c, vec3(0.5, 0.95, 1.0), smoothstep(0.45, 0.0, r) * (0.7 + 0.3 * sin(t * 2.0)));
        c *= smoothstep(1.35, 0.55, r) + 0.2;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mats = {};
  const matFor = (name) => {
    if (name === 'portal') return portalMat;
    if (mats[name]) return mats[name];
    const d = meta.materials[name];
    const col = new T.Color(d.color);
    return (mats[name] = new T.MeshToonMaterial({
      color: col, gradientMap: ramp,
      emissive: d.e ? col : 0x000000, emissiveIntensity: d.e ? 0.85 * d.e : 0,
      transparent: name === 'ring', opacity: name === 'ring' ? 0.75 : 1,
    }));
  };
  const outlineMat = new T.MeshBasicMaterial({ color: OUTLINE, side: T.BackSide, fog: true });
  outlineMat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute vec3 hn;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + hn * 0.04;');
  };

  // ── ถอดรหัสเมชที่บีบอัดจาก Blender ──
  const geoOf = (p) => {
    const n = p.n, q = new Uint16Array(bin, p.po, n * 3), nn = new Int8Array(bin, p.no, n * 3);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), hn = new Float32Array(n * 3);
    const span = [0, 1, 2].map((a) => p.hi[a] - p.lo[a]);
    const acc = new Map();
    for (let i = 0; i < n * 3; i++) {
      pos[i] = p.lo[i % 3] + (q[i] / 65535) * span[i % 3];
      nor[i] = nn[i] / 127;
    }
    // เส้นขอบการ์ตูน: เฉลี่ยนอร์มอลของจุดที่ซ้อนกัน เพื่อไม่ให้ขอบแตกตรงมุมคม
    for (let v = 0; v < n; v++) {
      const k = `${q[v * 3]},${q[v * 3 + 1]},${q[v * 3 + 2]}`;
      let a = acc.get(k);
      if (!a) acc.set(k, (a = [0, 0, 0]));
      a[0] += nor[v * 3]; a[1] += nor[v * 3 + 1]; a[2] += nor[v * 3 + 2];
    }
    for (let v = 0; v < n; v++) {
      const a = acc.get(`${q[v * 3]},${q[v * 3 + 1]},${q[v * 3 + 2]}`);
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      hn[v * 3] = a[0] / l; hn[v * 3 + 1] = a[1] / l; hn[v * 3 + 2] = a[2] / l;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));
    g.setAttribute('hn', new T.BufferAttribute(hn, 3));
    g.setIndex(new T.BufferAttribute(new Uint16Array(bin, p.io, p.i), 1));
    g.computeBoundingSphere();
    return g;
  };
  const build = (grp) => {
    const inner = new T.Group();
    for (const p of grp.parts) {
      const g = geoOf(p);
      inner.add(new T.Mesh(g, matFor(p.mat)));
      if (!NO_OUTLINE.has(p.mat) && grp.kind !== 'star') inner.add(new T.Mesh(g, outlineMat));
    }
    return inner;
  };

  // ── วางวัตถุตามตำแหน่งที่จัดไว้ใน Blender ──
  const items = [];
  let locoT, carT;
  for (const grp of meta.groups) {
    if (grp.kind === 'train-loco') { locoT = build(grp); continue; }
    if (grp.kind === 'train-car') { carT = build(grp); continue; }
    const outer = new T.Group();
    new T.Matrix4().fromArray(grp.m).decompose(outer.position, outer.quaternion, outer.scale);
    const inner = build(grp);
    outer.add(inner);
    scene.add(outer);
    const ph = items.length * 1.7;
    items.push({ outer, inner, kind: grp.kind, spin: grp.spin, bob: grp.bob, ph, x0: outer.position.x, y0: outer.position.y });
  }

  // ── รางและขบวนรถไฟ ──
  const base = meta.path.map(([x, y, z]) => new T.Vector3(x, y, z));
  let curve, railA, railB, kx = 1;
  const railMatA = new T.MeshBasicMaterial({ color: 0x8ff0ff, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, fog: true });
  const railMatB = new T.MeshBasicMaterial({ color: 0x9a7bff, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, fog: true });
  const makeRail = () => {
    curve = new T.CatmullRomCurve3(base.map((v) => new T.Vector3(v.x * kx, v.y, v.z)), true);
    for (const r of [railA, railB]) if (r) { scene.remove(r); r.geometry.dispose(); }
    railA = new T.Mesh(new T.TubeGeometry(curve, 1400, 0.035, 5, true), railMatA);
    railB = new T.Mesh(new T.TubeGeometry(curve, 700, 0.16, 6, true), railMatB);
    scene.add(railA, railB);
  };
  makeRail();
  const trains = [0, 0.5].map((off) => {
    const cars = [locoT.clone(), carT.clone(), carT.clone(), carT.clone()];
    cars.forEach((c) => { c.scale.setScalar(0.78); scene.add(c); });
    return { off, cars, gaps: [0, 2.2, 4.2, 6.2] };
  });
  const tmp = new T.Vector3();
  const placeTrains = (t) => {
    const len = curve.getLength();
    for (const tr of trains) {
      const head = (((t * 4.2) / len + tr.off) % 1) * len;
      tr.cars.forEach((c, i) => {
        const u = (((head - tr.gaps[i]) % len) + len) % len / len;
        curve.getPointAt(u, c.position);
        curve.getTangentAt(u, tmp);
        c.lookAt(tmp.add(c.position));
      });
    }
  };

  // ── กล้องตามการเลื่อน + ขยับตามเมาส์เล็กน้อย ──
  let W = 0, H = 0, aspect = 1, camY = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  const resize = () => {
    W = innerWidth; H = innerHeight; aspect = W / H;
    renderer.setSize(W, H, false);
    const halfW = Math.max(12 * Math.min(1, aspect / 1.6), 5.6);
    camera.aspect = aspect;
    camera.fov = (2 * Math.atan(halfW / aspect / 16) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    const nk = Math.min(1, Math.max(0.46, aspect / 1.6)); // จอแคบ: ดึงของเข้ามาให้ยังเห็น
    if (Math.abs(nk - kx) > 0.01) {
      kx = nk;
      for (const it of items) it.outer.position.x = it.x0 * kx;
      makeRail();
    }
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  if (!coarse) addEventListener('pointermove', (e) => { tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; }, { passive: true });
  const target = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return -(max > 0 ? scrollY / max : 0) * meta.col;
  };
  camY = target();

  const frame = (t) => {
    clock.t = t;
    portalMat.uniforms.t.value = t;
    camY += (target() - camY) * (reduced ? 1 : 0.12);
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    camera.position.set(mx * 1.6, camY - my * 1.0, 16);
    camera.lookAt(mx * 0.6, camY, 0);
    for (const it of items) {
      if (it.kind === 'portal') continue;
      if (it.kind === 'rock' || it.kind === 'star') {
        it.inner.rotation.x = t * it.spin * 0.6 + it.ph;
        it.inner.rotation.y = t * it.spin + it.ph;
      } else {
        it.inner.rotation.y = Math.sin(t * 0.5 + it.ph) * 0.35 * (it.spin / 0.25);
        it.inner.rotation.z = Math.sin(t * 0.37 + it.ph) * 0.06;
      }
      it.outer.position.y = it.y0 + Math.sin(t * 0.8 + it.ph) * it.bob * 2;
    }
    placeTrains(t);
    renderer.render(scene, camera);
  };

  canvas.classList.add('on');
  if (reduced) {
    const still = () => frame(6);
    still();
    addEventListener('scroll', () => requestAnimationFrame(still), { passive: true });
    addEventListener('resize', () => requestAnimationFrame(still), { passive: true });
    return;
  }
  const minDt = coarse ? 1000 / 40 : 1000 / 60 - 2;
  let last = 0;
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < minDt) return;
    last = now;
    frame(now / 1000);
  };
  requestAnimationFrame(loop);
}
