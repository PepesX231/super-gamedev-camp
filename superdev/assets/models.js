// โมเดล 3D ของสามระบบ (three.js) — ประกอบจากรูปทรงพื้นฐานในโค้ด ไม่มีไฟล์โมเดล
// ออกแบบให้เบา: โหลดเมื่อเลื่อนใกล้ถึงเท่านั้น, ใช้ WebGL context เดียววาดแล้วคัดลอกลง canvas 2D ของแต่ละการ์ด,
// ปกติเป็นภาพนิ่ง และขยับเฉพาะการ์ดที่กำลังชี้เมาส์ (จอสัมผัส: การ์ดที่อยู่กลางจอ) ที่ ~30fps
// ถ้า WebGL หรือ CDN ใช้ไม่ได้ ภาพ SVG ในการ์ดจะแสดงแทนตามเดิม
import { loadThree, webglOK, reduced, coarse, saveData } from './gfx.js';

export async function initModels() {
  const canvases = [...document.querySelectorAll('canvas[data-model]')];
  if (!canvases.length || saveData || !webglOK()) return;
  const T = await loadThree();

  // ── ชุดเครื่องมือสร้างโมเดล ──
  const M = (color, o = {}) => new T.MeshStandardMaterial({
    color, roughness: o.r ?? 0.5, metalness: o.m ?? 0, flatShading: Boolean(o.flat),
    emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    transparent: o.a != null, opacity: o.a ?? 1, depthWrite: o.a == null, side: o.double ? T.DoubleSide : T.FrontSide,
  });
  const add = (parent, geo, mat, [x = 0, y = 0, z = 0] = []) => {
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const sphere = (r, n = 20) => new T.SphereGeometry(r, n, Math.max(10, Math.round(n * 0.7)));
  const capsule = (r, len) => new T.CapsuleGeometry(r, len, 6, 14);
  // กล่องมุมมน: รูปสี่เหลี่ยมมุมมนที่หดเข้าเท่าขนาด bevel แล้ว extrude พร้อม bevel กลับออกมา
  const rbox = (w, h, d, r) => {
    const b = Math.min(r, d / 2 - 0.001), cr = Math.max(r - b, 0.001), x = w / 2 - b - cr, y = h / 2 - b - cr;
    const s = new T.Shape();
    s.absarc(x, y, cr, 0, Math.PI / 2);
    s.absarc(-x, y, cr, Math.PI / 2, Math.PI);
    s.absarc(-x, -y, cr, Math.PI, Math.PI * 1.5);
    s.absarc(x, -y, cr, Math.PI * 1.5, Math.PI * 2);
    const g = new T.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
    g.center();
    return g;
  };

  // ── 1) ฮีโร่และสกิล: นักบินอวกาศแมว + ลูกแก้วสกิลโคจรรอบตัว ──
  function heroModel() {
    const G = new T.Group(), cat = new T.Group();
    const suit = M(0xf6f3ff, { r: 0.55 }), shade = M(0xcfc7f5, { r: 0.6 }), fur = M(0xcbbfba, { r: 0.85 }), furLight = M(0xfdfaf7, { r: 0.85 });
    const pink = M(0xff9ab8, { r: 0.6 }), dark = M(0x1c1338, { r: 0.35 }), purple = M(0x7c4dff, { r: 0.4, e: 0x3a1fa8, ei: 0.6 });

    add(cat, capsule(0.62, 0.55), suit, [0, -0.55, 0]);
    add(cat, rbox(0.9, 0.95, 0.44, 0.14), M(0x8f88b8, { r: 0.5 }), [0, -0.45, -0.56]);
    add(cat, rbox(0.52, 0.36, 0.1, 0.05), purple, [0, -0.42, 0.6]);
    add(cat, sphere(0.62, 28), fur, [0, 0.55, 0]).scale.set(1.08, 0.95, 1);
    add(cat, sphere(0.42), furLight, [0, 0.4, 0.3]).scale.set(1.15, 0.8, 0.8);
    for (const s of [-1, 1]) {
      add(cat, new T.ConeGeometry(0.24, 0.4, 4), fur, [s * 0.4, 1.06, 0]).rotation.set(0, Math.PI / 4, -s * 0.25);
      add(cat, new T.ConeGeometry(0.13, 0.24, 4), pink, [s * 0.4, 1.03, 0.08]).rotation.set(0, Math.PI / 4, -s * 0.25);
      add(cat, sphere(0.15, 16), M(0xffffff, { r: 0.3 }), [s * 0.25, 0.63, 0.5]);
      add(cat, sphere(0.075, 12), dark, [s * 0.25, 0.63, 0.63]);
    }
    add(cat, sphere(0.06, 10), pink, [0, 0.47, 0.66]);
    add(cat, sphere(0.98, 32), M(0xc4dcff, { r: 0.05, m: 0.1, a: 0.2 }), [0, 0.58, 0]);
    add(cat, new T.TorusGeometry(0.6, 0.1, 10, 32), purple, [0, -0.02, 0]).rotation.x = Math.PI / 2;
    const limb = (s, armLike) => {
      const g = new T.Group();
      if (armLike) {
        add(g, capsule(0.2, 0.5), suit, [0, -0.33, 0]);
        add(g, sphere(0.24, 14), shade, [0, -0.75, 0]);
        add(g, sphere(0.11, 10), pink, [0, -0.8, 0.17]);
        g.position.set(s * 0.68, -0.2, 0);
        g.rotation.z = s * 1.1;
      } else {
        add(g, capsule(0.24, 0.4), suit, [0, -0.3, 0]);
        add(g, sphere(0.3, 14), shade, [0, -0.66, 0.08]).scale.set(1, 0.8, 1.25);
        add(g, sphere(0.16, 10), pink, [0, -0.72, 0.36]).scale.set(1, 1, 0.5);
        g.position.set(s * 0.34, -1.2, 0);
        g.rotation.set(-0.5, 0, s * 0.3);
      }
      cat.add(g);
      return g;
    };
    limb(-1, true);
    const wave = limb(1, true);
    limb(-1, false);
    limb(1, false);
    cat.scale.setScalar(0.92);
    cat.position.y = 0.22;
    G.add(cat);

    const orbit = new T.Group();
    const orbs = [0x6fe6ff, 0xffd23f, 0xff8fb8].map((col, i) =>
      add(orbit, new T.IcosahedronGeometry(0.2, 0), M(col, { e: col, ei: 0.9, flat: true }), [Math.cos(i * 2.094) * 1.85, 0, Math.sin(i * 2.094) * 1.85]));
    add(orbit, new T.TorusGeometry(1.85, 0.014, 6, 90), M(0xb9a2ff, { e: 0xb9a2ff, ei: 0.9, a: 0.55 })).rotation.x = Math.PI / 2;
    orbit.rotation.set(0.38, 0, 0.2);
    G.add(orbit);

    return { G, tick(t) {
      cat.position.y = 0.22 + Math.sin(t * 1.4) * 0.08;
      cat.rotation.z = Math.sin(t * 0.9) * 0.08;
      wave.rotation.z = 1.9 + Math.sin(t * 3) * 0.28;
      orbit.rotation.y = t * 0.9;
      orbs.forEach(o => (o.rotation.x = o.rotation.y = t * 2));
    } };
  }

  // ── 2) โลกเกมและศัตรู: ดาว low-poly มีวงแหวน + ยานศัตรูบินวน ──
  function worldModel() {
    const G = new T.Group();
    const geo = new T.IcosahedronGeometry(1.15, 2), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 1 + 0.07 * Math.sin(x * 7.1 + y * 3.3) * Math.cos(z * 5.7 + x * 2.1);
      p.setXYZ(i, x * k, y * k, z * k);
    }
    geo.computeVertexNormals();
    const planet = add(G, geo, M(0x7c5cff, { flat: true, r: 0.85 }));
    for (const [x, y, z, s] of [[0.6, 0.7, 0.6, 0.34], [-0.8, 0.2, 0.75, 0.26], [0.2, -0.85, 0.75, 0.3], [-0.5, -0.4, -0.95, 0.36], [0.9, -0.1, -0.7, 0.24]]) {
      add(planet, new T.IcosahedronGeometry(s, 0), M(0xb9a2ff, { flat: true, r: 0.9 }), [x, y, z]).scale.y = 0.45;
    }
    const ring = add(G, new T.RingGeometry(1.55, 2.05, 64), M(0xffd23f, { e: 0xff8a1f, ei: 0.55, a: 0.85, double: true }));
    ring.rotation.set(1.22, 0.18, 0);

    const ufo = color => {
      const g = new T.Group();
      add(g, sphere(0.32, 18), M(color, { r: 0.35 })).scale.y = 0.34;
      add(g, new T.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0x6fe6ff, { e: 0x6fe6ff, ei: 0.35, a: 0.8 }), [0, 0.06, 0]);
      for (let i = 0; i < 6; i++) add(g, sphere(0.035, 8), M(0xffd23f, { e: 0xffd23f, ei: 1 }), [Math.cos(i * 1.047) * 0.27, -0.04, Math.sin(i * 1.047) * 0.27]);
      return g;
    };
    const fleet = [[0xff6fa6, 1.75, 0.5, 0.9], [0xb56bff, 2.15, -0.35, -0.65], [0xff8a1f, 2.0, 0.15, 0.5]].map(([color, radius, tilt, speed], i) => {
      const pivot = new T.Group(), ship = ufo(color);
      ship.position.x = radius;
      pivot.rotation.set(tilt, i * 2.1, tilt * 0.6);
      pivot.add(ship);
      G.add(pivot);
      return { pivot, ship, speed, off: i * 2.1 };
    });
    const rocks = new T.Group();
    for (let i = 0; i < 5; i++) add(rocks, new T.BoxGeometry(0.13, 0.13, 0.13), M(0x6f62b8, { flat: true }), [Math.cos(i * 1.26) * 2.45, Math.sin(i * 2.2) * 0.5, Math.sin(i * 1.26) * 2.45]);
    G.add(rocks);

    return { G, tick(t) {
      planet.rotation.y = t * 0.3;
      rocks.rotation.y = -t * 0.2;
      for (const f of fleet) {
        f.pivot.rotation.y = f.off + t * f.speed;
        f.ship.rotation.z = Math.sin(t * 2.4 + f.off) * 0.25;
        f.ship.position.y = Math.sin(t * 1.8 + f.off) * 0.08;
      }
    } };
  }

  // ── 3) ประสบการณ์เล่นเกม: จอยเกม + หน้าจอ UI ลอยอยู่ด้านหลัง ──
  function experienceModel() {
    const G = new T.Group(), pad = new T.Group(), ui = new T.Group();
    const white = M(0xf6f3ff, { r: 0.4 }), dark = M(0x2a1f5c, { r: 0.5 });
    add(pad, rbox(2.2, 0.95, 0.5, 0.24), white);
    for (const s of [-1, 1]) add(pad, capsule(0.36, 0.55), white, [s * 0.95, -0.42, 0]).rotation.z = s * 0.35;
    add(pad, rbox(0.46, 0.15, 0.12, 0.04), dark, [-0.62, 0.08, 0.26]);
    add(pad, rbox(0.15, 0.46, 0.12, 0.04), dark, [-0.62, 0.08, 0.26]);
    const buttons = [[0.66, 0.27, 0x4ade80], [0.85, 0.08, 0xff8a1f], [0.66, -0.11, 0x4f7dff], [0.47, 0.08, 0xb56bff]].map(([x, y, col]) => {
      const b = add(pad, new T.CylinderGeometry(0.09, 0.09, 0.12, 20), M(col, { e: col, ei: 0.3, r: 0.3 }), [x, y, 0.26]);
      b.rotation.x = Math.PI / 2;
      return b;
    });
    for (const s of [-1, 1]) add(pad, rbox(0.14, 0.06, 0.08, 0.025), dark, [s * 0.13, 0.22, 0.25]);
    pad.rotation.x = -0.3;
    G.add(pad);

    add(ui, rbox(3.0, 1.8, 0.12, 0.1), M(0x1a1150, { r: 0.4 }));
    add(ui, rbox(3.12, 1.92, 0.06, 0.12), M(0x7c4dff, { e: 0x7c4dff, ei: 0.9 }), [0, 0, -0.06]);
    add(ui, rbox(1.05, 0.14, 0.05, 0.02), M(0xff8a1f, { e: 0xff8a1f, ei: 0.8 }), [-0.8, 0.62, 0.08]);
    add(ui, rbox(1.4, 0.26, 0.05, 0.02), M(0x6fe6ff, { e: 0x6fe6ff, ei: 0.7 }), [0, 0.12, 0.08]);
    add(ui, rbox(1.0, 0.16, 0.05, 0.02), M(0x8f88c8, { r: 0.6 }), [0, -0.24, 0.08]);
    add(ui, rbox(1.0, 0.16, 0.05, 0.02), M(0x8f88c8, { r: 0.6 }), [0, -0.5, 0.08]);
    const play = add(ui, new T.CylinderGeometry(0.17, 0.17, 0.08, 3), M(0xffd23f, { e: 0xff8a1f, ei: 0.7 }), [1.1, 0.62, 0.09]);
    play.rotation.set(Math.PI / 2, -Math.PI / 2, 0);
    ui.position.set(0, 0.7, -1);
    ui.scale.setScalar(0.94);
    G.add(ui);

    return { G, tick(t) {
      pad.position.y = -0.55 + Math.sin(t * 1.5) * 0.07;
      pad.rotation.x = -0.3 + Math.sin(t * 1.2) * 0.08;
      pad.rotation.z = Math.sin(t * 0.9) * 0.07;
      ui.position.y = 0.7 + Math.sin(t * 0.8 + 1) * 0.05;
      buttons.forEach((b, i) => (b.material.emissiveIntensity = 0.25 + Math.max(0, Math.sin(t * 3 - i * 1.4)) * 1.1));
    } };
  }

  const builders = { hero: heroModel, world: worldModel, experience: experienceModel };
  const rimColor = { hero: 0x6fe6ff, world: 0xff8fb8, experience: 0xffd23f };

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const cam = new T.PerspectiveCamera(30, 4 / 3, 0.1, 50);
  cam.position.set(0, 0.15, 7.6);

  const slots = canvases.map(canvas => {
    const id = canvas.dataset.model, build = builders[id];
    if (!build) return null;
    const scene = new T.Scene(), model = build();
    scene.add(new T.HemisphereLight(0xffffff, 0x3a2a8a, 1.7));
    const key = new T.DirectionalLight(0xffffff, 2.6);
    key.position.set(3, 5, 6);
    const rim = new T.DirectionalLight(rimColor[id], 2.4);
    rim.position.set(-4, 1.5, -3);
    scene.add(key, rim, model.G);
    // t = นาฬิกาของโมเดลเอง เดินเฉพาะตอนขยับ จึงต่อเนื่องเมื่อกลับมาชี้อีกครั้ง
    return { canvas, card: canvas.closest('[data-model-host]') || canvas, auto: canvas.hasAttribute('data-auto'), ctx: canvas.getContext('2d'), scene, model, visible: false, hot: false, drawn: false, w: 0, h: 0, t: 1.2 + Math.random() * 3, yaw: 0, pitch: 0, tyaw: 0, tpitch: 0 };
  }).filter(Boolean);
  if (!slots.length) return;

  // แต่ละ canvas มีขนาดของตัวเอง (โมเดลลอยขนาดเล็ก / โมเดลใหญ่ในหน้าต่างแนะนำ) — ปรับ renderer ตามช่องที่กำลังวาด
  let rw = 0, rh = 0, dpr = Math.min(devicePixelRatio || 1, coarse ? 1.25 : 1.5);
  const measure = s => {
    const nw = s.canvas.clientWidth, nh = s.canvas.clientHeight;
    if (!nw || !nh || (nw === s.w && nh === s.h)) return;
    s.w = nw; s.h = nh;
    s.canvas.width = Math.round(nw * dpr);
    s.canvas.height = Math.round(nh * dpr);
    s.drawn = false;
  };
  const fit = s => {
    if (s.w !== rw || s.h !== rh) {
      rw = s.w; rh = s.h;
      renderer.setPixelRatio(dpr);
      renderer.setSize(rw, rh, false);
      cam.aspect = rw / rh;
      // โมเดลออกแบบไว้สำหรับกรอบ 4:3 — กรอบแคบกว่านั้นถอยกล้องออก ไม่ให้วงแหวน/ของที่โคจรโดนขอบตัด
      cam.position.z = 13 * Math.max(1 / cam.aspect, 0.75);
      cam.updateProjectionMatrix();
    }
  };

  const draw = (s, dt) => {
    const k = 1 - Math.exp(-dt * 6);
    s.t += dt;
    s.yaw += (s.tyaw - s.yaw) * k;
    s.pitch += (s.tpitch - s.pitch) * k;
    s.model.tick(s.t);
    s.model.G.rotation.set(s.pitch + 0.08, Math.sin(s.t * 0.45) * 0.4 + s.yaw, 0);
    if (!s.w) measure(s);
    if (!s.w) return;
    fit(s);
    renderer.render(s.scene, cam);
    s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
    s.ctx.drawImage(renderer.domElement, 0, 0, s.canvas.width, s.canvas.height);
    if (!s.drawn) {
      s.drawn = true;
      s.canvas.parentElement.classList.add('ready');
    }
  };

  let running = false, last = 0, odd = false, slow = 0, lowPower = reduced;
  const frame = now => {
    if (!running) return;
    requestAnimationFrame(frame);
    if ((odd = !odd)) return; // ~30fps ก็พอสำหรับการหมุนช้า ๆ
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    // เครื่องตามไม่ทัน (เฟรมยาวต่อเนื่อง) → เลิกขยับ เหลือเป็นภาพนิ่ง
    if (dt > 0.07 && ++slow > 20) {
      lowPower = true;
      running = false;
      return;
    }
    for (const s of slots) if (s.visible && (s.hot || s.auto)) draw(s, dt);
  };
  const sync = () => {
    for (const s of slots) if (s.visible && !s.drawn) draw(s, 0); // ภาพนิ่งเมื่อเห็นครั้งแรก
    const want = !lowPower && !document.hidden && slots.some(s => s.visible && (s.hot || s.auto));
    if (want && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!want) running = false;
  };

  for (const s of slots) {
    if (coarse) continue;
    s.card.addEventListener('pointerenter', () => {
      s.hot = true;
      sync();
    });
    s.card.addEventListener('pointermove', ev => {
      const r = s.card.getBoundingClientRect();
      s.tyaw = ((ev.clientX - r.left) / r.width - 0.5) * 1.3;
      s.tpitch = ((ev.clientY - r.top) / r.height - 0.5) * 0.5;
    });
    s.card.addEventListener('pointerleave', () => {
      s.hot = false;
      s.tyaw = s.tpitch = 0;
      sync();
    });
  }

  const ro = new ResizeObserver(entries => {
    for (const en of entries) { const s = slots.find(x => x.canvas === en.target); if (s) measure(s); }
    sync();
  });
  slots.forEach(s => { measure(s); ro.observe(s.canvas); });
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      const s = slots.find(x => x.canvas === en.target);
      s.visible = en.isIntersecting;
      // จอสัมผัสไม่มี hover: ให้การ์ดที่อยู่เกือบเต็มจอเป็นตัวที่ขยับ
      if (coarse && !s.auto) s.hot = en.intersectionRatio >= 0.75;
    }
    sync();
  }, { threshold: [0, 0.75] });
  slots.forEach(s => io.observe(s.canvas));
  document.addEventListener('visibilitychange', sync);
}
