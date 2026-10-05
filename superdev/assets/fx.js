// เอฟเฟกต์บนหน้า: เผยเนื้อหาตอนเลื่อน, parallax ของฉากบนสุด, การ์ดเรืองแสง/เอียงตามเมาส์,
// เส้นทางภารกิจ และปุ่มสมัครบน header ที่โผล่เฉพาะตอนไม่มีปุ่มสมัครอื่นอยู่ในจอ
// ทั้งหมดเป็นส่วนเสริม เนื้อหาอ่านได้ครบแม้ไฟล์นี้ไม่ทำงาน
import { reduced, coarse } from './gfx.js';

export function initFx() {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const road = document.querySelector('.road');
  const hasIO = 'IntersectionObserver' in window;

  // เผยเนื้อหาเมื่อเลื่อนมาถึง — ตรวจตำแหน่งเองในเฟรมเดียวกับงานเลื่อนอื่น ๆ
  let pending = [...document.querySelectorAll('.reveal')];
  const reveal = vh => {
    if (!pending.length) return;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top > vh * 0.94) return true; // ยังอยู่ใต้จอ
      el.classList.add('in'); // อยู่ในจอ หรือถูกเลื่อนผ่านไปแล้ว (เช่น กระโดดด้วยลิงก์เมนู)
      return false;
    });
  };
  if (reduced) {
    pending.forEach(el => el.classList.add('in'));
    pending = [];
  }

  // งานที่ผูกกับการเลื่อน รวมไว้ในเฟรมเดียว
  let queued = false;
  const onScroll = () => {
    queued = false;
    const y = scrollY, vh = innerHeight;
    header?.classList.toggle('scrolled', y > 12);
    reveal(vh);
    if (hero && !reduced) {
      const h = hero.offsetHeight || 1;
      if (y < h) hero.style.setProperty('--sy', (y / h).toFixed(3));
    }
    // เส้นทางภารกิจค่อย ๆ เติมสีตามการเลื่อน
    if (road) {
      const r = road.getBoundingClientRect();
      if (r.bottom > -200 && r.top < vh + 200) {
        const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height * 0.9 || 1)));
        road.style.setProperty('--p', p.toFixed(4));
      }
    }
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  onScroll();
  // ฟอนต์/รูปที่โหลดทีหลังทำให้ตำแหน่งขยับ จึงตรวจซ้ำอีกรอบ
  addEventListener('load', queue, { once: true });
  setTimeout(queue, 600);

  if (hasIO) {
    // หยุดแอนิเมชันของส่วนที่อยู่นอกจอ เพื่อไม่ให้เครื่องทำงานกับสิ่งที่มองไม่เห็น
    const idle = new IntersectionObserver(entries => {
      for (const en of entries) en.target.classList.toggle('is-off', !en.isIntersecting);
    }, { rootMargin: '120px' });
    document.querySelectorAll('.hero, .section, .cz').forEach(el => idle.observe(el));

    // ปุ่มสมัครบน header: แสดงเฉพาะตอนที่ไม่มีปุ่มสมัครหลักอยู่ในจอ (เห็นปุ่มสมัครทีละปุ่ม)
    const mains = document.querySelectorAll('main a[data-register]');
    if (header && mains.length) {
      header.classList.add('cta-auto');
      const seen = new Set();
      const io = new IntersectionObserver(entries => {
        for (const en of entries) en.isIntersecting ? seen.add(en.target) : seen.delete(en.target);
        header.classList.toggle('show-cta', seen.size === 0);
      });
      mains.forEach(el => io.observe(el));
    }

    // โมเดล 3D: โหลดเมื่อเลื่อนใกล้ถึงส่วนนั้นเท่านั้น
    const stage = document.querySelector('canvas[data-model]')?.closest('.section');
    if (stage) {
      const near = new IntersectionObserver(entries => {
        if (!entries.some(en => en.isIntersecting)) return;
        near.disconnect();
        import('./models.js').then(m => m.initModels()).catch(() => {});
      }, { rootMargin: '500px' });
      near.observe(stage);
    }
  }

  // เอฟเฟกต์ตามเมาส์ (เฉพาะอุปกรณ์ที่มีเมาส์)
  if (!coarse && !reduced) {
    if (hero) {
      let mx = 0, my = 0, waiting = false;
      hero.addEventListener('pointermove', ev => {
        const r = hero.getBoundingClientRect();
        mx = (ev.clientX - r.left) / r.width - 0.5;
        my = (ev.clientY - r.top) / r.height - 0.5;
        if (waiting) return;
        waiting = true;
        requestAnimationFrame(() => {
          waiting = false;
          hero.style.setProperty('--px', mx.toFixed(3));
          hero.style.setProperty('--py', my.toFixed(3));
        });
      });
      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--px', 0);
        hero.style.setProperty('--py', 0);
      });
    }
    document.addEventListener('pointermove', ev => {
      const el = ev.target.closest?.('.glow');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      if (el.classList.contains('tilt')) {
        el.style.setProperty('--rx', (x - 0.5).toFixed(3));
        el.style.setProperty('--ry', (y - 0.5).toFixed(3));
      }
    }, { passive: true });
    document.querySelectorAll('.tilt').forEach(el =>
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', 0);
        el.style.setProperty('--ry', 0);
      }));
  }
}
