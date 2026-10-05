import { c, e, preview, pend, dateText, priceText, slotsText, registrationState, mount } from './core.js';

const paths = { root: '../', home: '../index.html', register: 'index.html', privacy: '../privacy/index.html', cta: false };
const en = c.enrollment;
const reg = registrationState();
const group = en.group.enabled;
const maxMembers = group ? en.group.maxMembers : 1;
const useSlot = c.timeSlots.selectable && c.timeSlots.slots.length > 1;

const CONTACT = {
  phone: { label: 'เบอร์โทรศัพท์', type: 'tel', mode: 'tel', auto: 'tel', hint: 'ตัวเลข 9–10 หลัก', test: v => /^0\d{8,9}$/.test(v.replace(/[\s-]/g, '')), error: 'กรอกเบอร์โทรศัพท์ 9–10 หลัก ขึ้นต้นด้วย 0' },
  email: { label: 'อีเมล', type: 'email', mode: 'email', auto: 'email', hint: 'เช่น name@example.com', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), error: 'กรอกอีเมลให้ถูกต้อง เช่น name@example.com' },
  line: { label: 'LINE ID', type: 'text', mode: 'text', auto: 'off', hint: 'ไอดีที่ค้นหาเพิ่มเพื่อนได้', test: v => v.length >= 2, error: 'กรอก LINE ID' },
};
const contactDef = CONTACT[en.contactMethod] ?? {
  label: 'ช่องทางติดต่อ', type: 'text', mode: 'text', auto: 'off',
  hint: 'ประเภทช่องทางติดต่อหลักรอยืนยันจากผู้จัด', test: v => v.length >= 3, error: 'กรอกช่องทางติดต่อ',
};

const STATUS = {
  received: ['ได้รับใบสมัครแล้ว', 'ระบบบันทึกใบสมัครเรียบร้อย ยังไม่ถือเป็นการยืนยันสิทธิ์เข้าค่าย'],
  awaiting_payment: ['รอชำระเงิน', 'ใบสมัครถูกบันทึกแล้ว สิทธิ์เข้าค่ายจะได้รับการยืนยันหลังตรวจสอบการชำระเงิน'],
  under_review: ['อยู่ระหว่างตรวจสอบ', 'ทีมงานกำลังตรวจสอบใบสมัคร ยังไม่ถือเป็นการยืนยันสิทธิ์เข้าค่าย'],
  confirmed: ['ยืนยันสิทธิ์เข้าค่ายแล้ว', 'การสมัครเสร็จสมบูรณ์'],
};

const field = ({ id, label, optional = false, hint = '', type = 'text', mode = 'text', auto = 'off', data = '' }) => `
<div class="field">
  <label for="${id}">${label}${optional ? ' <span class="opt">(ไม่บังคับ)</span>' : ''}</label>
  ${hint ? `<p class="hint" id="${id}-hint">${e(hint)}</p>` : ''}
  <input id="${id}" name="${id}" type="${type}" inputmode="${mode}" autocomplete="${auto}" maxlength="120"
    ${optional ? '' : 'aria-required="true"'} ${hint ? `aria-describedby="${id}-hint"` : ''} ${data}>
  <p class="field-error" id="${id}-error" hidden></p>
</div>`;

let seq = 0;
function participantCard() {
  const n = seq++;
  return `
<fieldset class="card participant" data-n="${n}">
  <legend><span class="p-title">ผู้เข้าร่วม</span></legend>
  ${field({ id: `p${n}-fullName`, label: 'ชื่อ–นามสกุล', auto: group ? 'off' : 'name', data: 'data-f="fullName"' })}
  ${field({ id: `p${n}-nickname`, label: 'ชื่อเล่น', optional: true, data: 'data-f="nickname"' })}
  ${en.fields.schoolLevel ? field({ id: `p${n}-schoolLevel`, label: 'ระดับชั้น', data: 'data-f="schoolLevel"' }) : ''}
  ${group ? `<button type="button" class="btn btn-ghost btn-sm remove-p">ลบผู้เข้าร่วมคนนี้</button>` : ''}
</fieldset>`;
}

const summary = `
<dl class="facts stack">
  <div class="fact"><dt>วันที่</dt><dd>${dateText()}</dd></div>
  <div class="fact"><dt>เวลา</dt><dd>${slotsText()} น.${c.timeSlots.arrangement ? '' : ` ${pend('รอยืนยันการจัดรอบ')}`}</dd></div>
  <div class="fact"><dt>ค่าสมัคร</dt><dd>${priceText()}${c.price.unit ? ` ${e(c.price.unit)}` : ` ${pend('รอยืนยันหน่วย')}`}</dd></div>
  ${c.format.label ? `<div class="fact"><dt>รูปแบบ</dt><dd>${e(c.format.label)}</dd></div>` : ''}
</dl>`;

const closedHtml = `
<div class="card notice">
  <h2>ปิดรับสมัครแล้ว</h2>
  <p>ขอบคุณที่สนใจ ${e(c.camp.name)}</p>
  ${c.registration.waitlistUrl ? `<a class="btn btn-primary" href="${e(c.registration.waitlistUrl)}">ลงชื่อรอคิว</a>` : `<a class="btn btn-ghost" href="../index.html"><span>กลับหน้าหลัก</span></a>`}
</div>`;

const formHtml = `
<ol class="progress" aria-label="ขั้นตอนการสมัคร">
  <li data-step="form" aria-current="step">กรอกข้อมูล</li>
  <li data-step="review">ตรวจสอบ</li>
  <li data-step="result">ผลการส่ง</li>
</ol>
<p class="sr-only" id="live" role="status" aria-live="polite"></p>

<form id="reg-form" novalidate>
  ${en.endpoint ? '' : `<div class="card notice"><strong>โหมดตัวอย่าง</strong> — ยังไม่ได้เชื่อมต่อระบบรับสมัคร ข้อมูลที่กรอกในหน้านี้จะไม่ถูกส่งหรือบันทึก</div>`}
  <div id="error-summary" class="error-summary" role="alert" tabindex="-1" hidden></div>

  <div id="participants">${participantCard()}</div>
  ${group ? `<button type="button" class="btn btn-ghost" id="add-p">+ เพิ่มผู้เข้าร่วม (สูงสุด ${maxMembers} คน)</button>` : ''}

  <fieldset class="card">
    <legend>${group ? 'ผู้ติดต่อของกลุ่ม' : 'ช่องทางติดต่อ'}</legend>
    ${group ? `<p class="hint">ทีมงานจะแจ้งข้อมูลของทั้งกลุ่มผ่านช่องทางนี้ การสมัครพร้อมกันเป็นกลุ่มไม่ได้หมายถึงการจัดทีมทำเกม</p>` : ''}
    ${field({ id: 'contact', label: contactDef.label, hint: contactDef.hint, type: contactDef.type, mode: contactDef.mode, auto: contactDef.auto })}
    ${en.fields.parentContact ? field({ id: 'parentContact', label: 'เบอร์ติดต่อผู้ปกครอง', type: 'tel', mode: 'tel', hint: 'ตัวเลข 9–10 หลัก' }) : ''}
    ${useSlot ? `
    <div class="field" role="radiogroup" aria-labelledby="slot-label" id="slot">
      <p id="slot-label" class="label">รอบที่ต้องการ</p>
      ${c.timeSlots.slots.map((s, i) => `<label class="radio"><input type="radio" name="slot" value="${e(s)}" ${i ? '' : 'id="slot-0"'}> ${e(s)} น.</label>`).join('')}
      <p class="field-error" id="slot-error" hidden></p>
    </div>` : ''}
  </fieldset>

  <div class="privacy-note">
    <p>เราใช้ข้อมูลนี้เพื่อดำเนินการสมัครและติดต่อเรื่องค่ายเท่านั้น อ่านรายละเอียดได้ที่ <a href="${paths.privacy}">ข้อมูลความเป็นส่วนตัว</a></p>
    ${en.marketingConsent ? `<label class="radio"><input type="checkbox" id="marketing"> ยินดีรับข่าวสารกิจกรรมอื่นจาก ${e(c.camp.organizer)} (ไม่บังคับ และไม่มีผลต่อการสมัคร)</label>` : ''}
  </div>

  <button type="submit" class="btn btn-primary">ตรวจสอบข้อมูล</button>
</form>

<section id="review" tabindex="-1" hidden aria-labelledby="review-h">
  <h2 id="review-h">ตรวจสอบสรุปใบสมัคร</h2>
  <div id="review-body" class="card"></div>
  <div id="submit-error" class="error-summary" role="alert" tabindex="-1" hidden></div>
  <div class="cta-row">
    <button type="button" class="btn btn-ghost" id="back">แก้ไขข้อมูล</button>
    <button type="button" class="btn btn-primary" id="send">${en.endpoint ? 'ส่งใบสมัคร' : 'ทดลองส่ง (โหมดตัวอย่าง)'}</button>
  </div>
</section>

<section id="result" tabindex="-1" hidden aria-labelledby="result-h"></section>`;

mount(paths, `
<div class="wrap reg-grid section">
  <div class="reg-main">
    <p class="kicker">${e(c.camp.name)}</p>
    <h1>สมัครเข้าค่าย</h1>
    ${reg.state === 'closed' ? closedHtml : formHtml}
  </div>
  <aside class="card reg-side" aria-label="สรุปข้อมูลค่าย">
    <h2>${e(c.camp.headline)}</h2>
    ${summary}
    ${en.payment ? '' : `<p class="muted">การส่งแบบฟอร์มเป็นการบันทึกใบสมัคร การยืนยันสิทธิ์เข้าค่ายจะแจ้งในขั้นตอนถัดไป</p>`}
  </aside>
</div>`);

if (reg.state !== 'closed') init();

function init() {
  const $ = id => document.getElementById(id);
  const form = $('reg-form'), list = $('participants'), review = $('review'), result = $('result');
  const live = $('live'), errBox = $('error-summary'), submitErr = $('submit-error'), sendBtn = $('send');
  let payload = null, idemKey = null, sending = false;

  const cards = () => [...list.querySelectorAll('.participant')];
  const relabel = () => {
    const all = cards();
    all.forEach((card, i) => {
      card.querySelector('.p-title').textContent = all.length > 1 ? `ผู้เข้าร่วมคนที่ ${i + 1}` : 'ผู้เข้าร่วม';
      const rm = card.querySelector('.remove-p');
      if (rm) rm.hidden = all.length === 1;
    });
    if ($('add-p')) $('add-p').hidden = all.length >= maxMembers;
  };
  relabel();

  $('add-p')?.addEventListener('click', () => {
    if (cards().length >= maxMembers) return;
    list.insertAdjacentHTML('beforeend', participantCard());
    relabel();
    cards().at(-1).querySelector('input').focus();
  });
  list.addEventListener('click', ev => {
    const rm = ev.target.closest('.remove-p');
    if (!rm) return;
    rm.closest('.participant').remove();
    relabel();
    live.textContent = 'ลบผู้เข้าร่วมแล้ว';
    cards().at(-1).querySelector('input').focus();
  });

  function setError(id, msg) {
    const input = $(id), box = $(`${id}-error`);
    if (!box) return;
    box.textContent = msg || '';
    box.hidden = !msg;
    const target = input?.matches('input') ? input : null;
    if (target) {
      target.toggleAttribute('aria-invalid', Boolean(msg));
      const ids = [$(`${id}-hint`) && `${id}-hint`, msg && `${id}-error`].filter(Boolean).join(' ');
      ids ? target.setAttribute('aria-describedby', ids) : target.removeAttribute('aria-describedby');
    }
  }

  function showErrors(errors) {
    form.querySelectorAll('.field-error').forEach(b => setError(b.id.replace(/-error$/, ''), ''));
    errors.forEach(([id, msg]) => setError(id, msg));
    errBox.hidden = errors.length === 0;
    if (!errors.length) return;
    errBox.innerHTML = `<h2>กรุณาแก้ไข ${errors.length} รายการ</h2><ul>${errors
      .map(([id, msg, label]) => `<li><a href="#${id === 'slot' ? 'slot-0' : id}">${e(label ? `${label}: ${msg}` : msg)}</a></li>`).join('')}</ul>`;
    errBox.focus();
  }
  errBox.addEventListener('click', ev => {
    const a = ev.target.closest('a');
    if (!a) return;
    ev.preventDefault();
    $(a.getAttribute('href').slice(1))?.focus();
  });

  function collect() {
    const errors = [];
    const all = cards();
    const participants = all.map((card, i) => {
      const who = all.length > 1 ? `คนที่ ${i + 1}` : '';
      const get = f => card.querySelector(`[data-f="${f}"]`);
      const name = get('fullName').value.trim();
      if (name.length < 2) errors.push([get('fullName').id, 'กรอกชื่อ–นามสกุล', who]);
      const p = { fullName: name, nickname: get('nickname').value.trim() };
      if (get('schoolLevel')) {
        p.schoolLevel = get('schoolLevel').value.trim();
        if (!p.schoolLevel) errors.push([get('schoolLevel').id, 'กรอกระดับชั้น', who]);
      }
      return p;
    });
    const data = { participants, contact: { method: en.contactMethod, value: $('contact').value.trim() } };
    if (!contactDef.test(data.contact.value)) errors.push(['contact', contactDef.error]);
    if ($('parentContact')) {
      data.parentContact = $('parentContact').value.trim();
      if (!CONTACT.phone.test(data.parentContact)) errors.push(['parentContact', 'กรอกเบอร์ติดต่อผู้ปกครอง 9–10 หลัก']);
    }
    if (useSlot) {
      data.slot = form.querySelector('input[name="slot"]:checked')?.value ?? null;
      if (!data.slot) errors.push(['slot', 'เลือกรอบที่ต้องการ']);
    }
    data.marketingConsent = Boolean($('marketing')?.checked);
    return { data, errors };
  }

  function show(step) {
    form.hidden = step !== 'form';
    review.hidden = step !== 'review';
    result.hidden = step !== 'result';
    document.querySelectorAll('.progress li').forEach(li =>
      li.dataset.step === step ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current'));
    window.scrollTo({ top: 0 });
  }

  const participantRows = d => d.participants
    .map((p, i) => `<div class="fact"><dt>${d.participants.length > 1 ? `ผู้เข้าร่วมคนที่ ${i + 1}` : 'ผู้เข้าร่วม'}</dt><dd>${e(p.fullName)}${p.nickname ? ` (${e(p.nickname)})` : ''}${p.schoolLevel ? ` · ${e(p.schoolLevel)}` : ''}</dd></div>`).join('');

  function renderReview(d) {
    const n = d.participants.length;
    const cost = c.price.perParticipant
      ? `${(c.price.amount * n).toLocaleString('th-TH')} ${e(c.price.currency)}${n > 1 ? ` (${n} คน × ${priceText()})` : ''}`
      : `${priceText()}${c.price.unit ? ` ${e(c.price.unit)}` : ` ${pend('รอยืนยันหน่วยและยอดรวม')}`}`;
    $('review-body').innerHTML = `
<dl class="facts stack">
  ${participantRows(d)}
  <div class="fact"><dt>${e(contactDef.label)}</dt><dd>${e(d.contact.value)}</dd></div>
  ${d.parentContact ? `<div class="fact"><dt>เบอร์ติดต่อผู้ปกครอง</dt><dd>${e(d.parentContact)}</dd></div>` : ''}
  ${d.slot ? `<div class="fact"><dt>รอบที่เลือก</dt><dd>${e(d.slot)} น.</dd></div>` : ''}
  <div class="fact"><dt>วันที่</dt><dd>${dateText()}</dd></div>
  <div class="fact"><dt>ค่าสมัคร</dt><dd>${cost}</dd></div>
</dl>`;
  }

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const { data, errors } = collect();
    showErrors(errors);
    if (errors.length) return;
    // ข้อมูลเปลี่ยน = ใบสมัครใหม่; ข้อมูลเดิม (กดย้อนแล้วกลับมา หรือกดส่งซ้ำ) ใช้ key เดิมเพื่อกันบันทึกซ้ำ
    const json = JSON.stringify(data);
    if (json !== JSON.stringify(payload)) {
      payload = data;
      idemKey = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    renderReview(data);
    submitErr.hidden = true;
    show('review');
    review.focus();
  });

  $('back').addEventListener('click', () => {
    show('form');
    form.querySelector('input').focus();
  });

  function fail(msg) {
    submitErr.innerHTML = `<h2>ยังส่งใบสมัครไม่สำเร็จ</h2><p>${e(msg)} ข้อมูลที่กรอกยังอยู่ครบ กด “ส่งใบสมัคร” เพื่อลองอีกครั้งได้</p>`;
    submitErr.hidden = false;
    submitErr.focus();
  }

  // แปลง key ของ backend เช่น "participants.0.fullName" เป็น id ของช่องในฟอร์ม
  function serverErrors(errs) {
    const all = cards();
    return Object.entries(errs).map(([key, msg]) => {
      const m = key.match(/^participants\.(\d+)\.(\w+)$/);
      const id = m ? all[+m[1]]?.querySelector(`[data-f="${m[2]}"]`)?.id : key;
      return [id && $(`${id}-error`) ? id : 'contact', String(msg), m && all.length > 1 ? `คนที่ ${+m[1] + 1}` : ''];
    });
  }

  sendBtn.addEventListener('click', async () => {
    if (sending) return;
    if (!en.endpoint) {
      result.innerHTML = `
<div class="card notice">
  <h2 id="result-h">โหมดตัวอย่าง: ยังไม่มีการบันทึกใบสมัคร</h2>
  <p>ข้อมูลผ่านการตรวจสอบรูปแบบแล้ว แต่เว็บไซต์ยังไม่ได้เชื่อมต่อระบบรับสมัคร จึงไม่มีการส่งหรือเก็บข้อมูล และไม่มีรหัสอ้างอิง</p>
  <a class="btn btn-ghost" href="../index.html"><span>กลับหน้าหลัก</span></a>
</div>`;
      show('result');
      result.focus();
      return;
    }
    sending = true;
    sendBtn.disabled = true;
    sendBtn.textContent = 'กำลังส่งใบสมัคร…';
    live.textContent = 'กำลังส่งใบสมัคร';
    submitErr.hidden = true;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(en.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
        body: JSON.stringify(payload),
        signal: ctl.signal,
      });
      const body = await res.json().catch(() => null);
      if (res.status === 422 && body?.errors) {
        show('form');
        showErrors(serverErrors(body.errors));
      } else if (res.ok && body?.reference && STATUS[body.status]) {
        renderResult(body);
      } else {
        fail('ระบบรับสมัครตอบกลับผิดพลาด');
      }
    } catch {
      fail('เชื่อมต่อระบบรับสมัครไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต');
    } finally {
      clearTimeout(timer);
      sending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = 'ส่งใบสมัคร';
    }
  });

  function renderResult(body) {
    const [title, text] = STATUS[body.status];
    const next = body.nextSteps || en.nextSteps[body.status];
    result.innerHTML = `
<div class="card result-panel">
  <p class="kicker">สถานะใบสมัคร</p>
  <h2 id="result-h">${title}</h2>
  <p>${text}</p>
  <p class="reference">รหัสอ้างอิง <strong>${e(body.reference)}</strong></p>
  <dl class="facts stack">${participantRows(payload)}</dl>
  <h3>ขั้นตอนถัดไป</h3>
  <p>${next ? e(next) : 'โปรดบันทึกรหัสอ้างอิงนี้ไว้สำหรับติดต่อทีมงาน'}</p>
  <a class="btn btn-ghost" href="../index.html"><span>กลับหน้าหลัก</span></a>
</div>`;
    form.reset();
    payload = idemKey = null;
    show('result');
    live.textContent = title;
    result.focus();
  }
}
