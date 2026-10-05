import { c, e, pend, val, mount } from './core.js';

const en = c.enrollment, p = c.privacy;
const collected = [
  'ชื่อ–นามสกุล และชื่อเล่น (ถ้ากรอก) ของผู้เข้าร่วม',
  'ช่องทางติดต่อหนึ่งช่องทาง',
  en.fields.schoolLevel && 'ระดับชั้น',
  en.fields.parentContact && 'เบอร์ติดต่อผู้ปกครอง',
  c.timeSlots.selectable && 'รอบเวลาที่เลือก',
].filter(Boolean);

mount({ root: '../', home: '../index.html', register: '../register/index.html', privacy: 'index.html' }, `
<div class="wrap narrow"><div class="card prose">
  <p class="kicker">${e(c.camp.name)}</p>
  <h1>ข้อมูลความเป็นส่วนตัว</h1>
  ${p.confirmed ? '' : `<p>${pend('ฉบับร่าง รอผู้จัดตรวจและอนุมัติ')}</p>`}

  <h2>ข้อมูลที่เราเก็บ</h2>
  <ul>${collected.map(i => `<li>${e(i)}</li>`).join('')}</ul>
  <p>เราไม่เก็บเลขบัตรประชาชน ที่อยู่ หรือข้อมูลอื่นที่ไม่จำเป็นต่อการสมัคร</p>

  <h2>เราใช้ข้อมูลเพื่ออะไร</h2>
  <p>เพื่อดำเนินการสมัคร ยืนยันสิทธิ์ และติดต่อเรื่องการเข้าร่วม ${e(c.camp.name)} เท่านั้น${en.marketingConsent ? ' การรับข่าวสารกิจกรรมอื่นเป็นความยินยอมแยกต่างหากและไม่มีผลต่อการสมัคร' : ''}</p>

  <h2>ผู้ดูแลข้อมูล</h2>
  <p>${e(p.controller)} เป็นผู้ดูแลข้อมูล และจำกัดการเข้าถึงเฉพาะทีมงานที่เกี่ยวข้องกับการจัดค่าย</p>

  <h2>ระยะเวลาเก็บข้อมูล</h2>
  <p>${val(p.retention)}</p>

  <h2>การขอดู แก้ไข หรือลบข้อมูล</h2>
  <p>${val(p.contact)}</p>
</div></div>`);
