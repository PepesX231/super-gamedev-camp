// แหล่งข้อมูลเดียวของค่าย — แก้ไฟล์นี้แล้วรีเฟรชหน้าเว็บ ไม่ต้อง build
// ค่าที่เป็น null คือ "ยังไม่ยืนยัน": โหมด preview จะแสดงป้าย "รอยืนยันรายละเอียด"
// โหมด live จะซ่อนส่วนเสริมที่ยังว่าง และถ้าค่าที่จำเป็นยังไม่ครบ เว็บจะกลับไปแสดงแบบ preview เอง

export default {
  // 'preview' = สำหรับตรวจทาน (noindex, มีแถบแจ้งเตือน) | 'live' = เผยแพร่จริง
  mode: 'preview',

  site: {
    baseUrl: 'https://hamsterhub.co/superdev',
  },

  // การฝังในเว็บหลัก Hamster Hub (โปรเจค profile_HH): ไฟล์ชุดนี้ถูกวางที่ public/superdev-site
  // และแสดงผ่านหน้า /superdev ปุ่มสมัครจะเปิดระบบรับสมัครของเว็บหลักแทนฟอร์มตัวอย่างในชุดนี้
  // ตั้งเป็น null ถ้านำไปวางที่อื่นแบบ static ล้วน
  host: {
    route: '/superdev',
    registerRoute: '/superdev/register',
    staticPrefix: '/superdev-site/',
  },

  camp: {
    name: 'Super GameDev Camp',
    organizer: 'Hamster Hub',
    headline: 'จากคนเล่น สู่คนสร้างเกม',
    subhead: 'ภารกิจ 4 วัน เรียนรู้การสร้างเกมเอาตัวรอดธีมอวกาศด้วย Unity และ AI',
    // ชื่อโปรเจกต์ชั่วคราวจากบรีฟ — แสดงเฉพาะ preview จนกว่า confirmed จะเป็น true
    workingTitle: { text: 'A Chance of the Survivor', confirmed: false },
  },

  dates: {
    startDay: 9,
    endDay: 12,
    month: 10,
    monthTh: 'ตุลาคม',
    year: null, // ค.ศ. เช่น 2026 — ยังไม่ยืนยัน จึงไม่แสดงปี
  },

  timeSlots: {
    slots: ['14:00–16:00', '19:00–21:00'],
    // คำอธิบายว่า 2 ช่วงเวลานี้จัดอย่างไร (ทุกวันทั้งสองช่วง / แยกรอบ / เลือกรอบ)
    arrangement: null,
    // true เฉพาะเมื่อยืนยันว่าเป็น "รอบให้เลือก" — จะเปิดตัวเลือกรอบในฟอร์มสมัคร
    selectable: false,
  },

  price: {
    amount: 490,
    currency: 'บาท',
    unit: null, // เช่น 'ต่อคน'
    perParticipant: false, // true เมื่อยืนยันว่าคิดต่อคน (ใช้คำนวณยอดรวมแบบกลุ่ม)
    includes: [], // สิ่งที่รวมในค่าสมัคร เฉพาะที่ยืนยันแล้ว
  },

  format: {
    label: null, // เช่น 'ออนไลน์ผ่าน Zoom' หรือ 'On-site'
    detail: null, // แพลตฟอร์ม / สถานที่
  },

  audience: {
    who: null, // ช่วงอายุหรือระดับชั้น
    prerequisites: null, // พื้นฐานที่ต้องมี
    language: null, // ภาษาที่ใช้สอน
    teamMode: null, // งานเดี่ยวหรือทีม
    capacity: null, // จำนวนที่รับ
  },

  preparation: {
    computer: null, // สเปกและระบบปฏิบัติการที่รองรับ
    unity: null, // เวอร์ชัน Unity และการติดตั้ง
    internet: null, // อินเทอร์เน็ต / แพลตฟอร์ม
    accounts: null, // ซอฟต์แวร์หรือบัญชีที่ต้องมี
    instructions: null, // ขั้นตอนเตรียมตัวก่อนวันค่าย
  },

  extras: {
    certificate: null,
    recordings: null,
    finalAnnouncement: null, // ความหมายของ "ช่วงประกาศผล" วันสุดท้าย
    absencePolicy: null, // กรณีเข้าร่วมไม่ได้ / นโยบายคืนเงิน
  },

  // { name, role, experience, photo } — เฉพาะบุคคลจริงที่ยืนยันแล้ว ว่างไว้ = ซ่อนทั้ง section
  instructors: [],
  // { type: 'photo'|'project'|'quote', src, alt, caption, attribution } — ของจริงที่ได้รับอนุญาตเท่านั้น
  evidence: [],

  // ผลงานจริงจากค่ายครั้งก่อนของ Hamster Hub — ตั้ง showcase: null เพื่อซ่อนทั้ง section
  showcase: {
    title: 'COMMAND SELECT',
    tagline: 'Steal the show // Take their heart',
    about: 'เกมแอ็กชันมุมมองบุคคลที่หนึ่ง บุกเข้า The Vault ฝ่าศัตรูด้วยอาวุธและสกิล แล้วสู้บอส The Core ทุกระบบทำเองทั้งหมด',
    tags: ['Unity', 'First-person', 'Boss fight', 'Cutscene', 'UI'],
    credits: ['นาย ชมน์ปภพ ดีจริง', 'นาย อนิรุจ เรืองสุข'],
    link: { label: 'ลองเล่นเดโมบน itch.io', href: 'https://pepess1.itch.io/comand-select', note: 'เดโมรองรับเฉพาะ PC (Windows)' },
    video: {
      src: 'assets/media/command-select-trailer.mp4',
      poster: 'assets/media/trailer-poster.webp',
      length: '1:42',
    },
    shots: [
      { src: 'assets/media/shot-core.webp', title: 'THE CORE', caption: 'บอสผู้พิทักษ์ห้องนิรภัย' },
      { src: 'assets/media/shot-eye.webp', title: 'IT SEES YOU.', caption: 'Cutscene ตอน The Vault ตื่น' },
    ],
  },

  registration: {
    // ISO พร้อมเขตเวลาไทย เช่น '2026-10-07T23:59:00+07:00' — มีค่าเมื่อไรจึงแสดงนับถอยหลัง
    deadline: null,
    waitlistUrl: null,
  },

  enrollment: {
    // URL ของ backend ที่รับใบสมัคร (ดูสัญญา API ใน README) — null = ฟอร์มทำงานแบบตัวอย่าง ไม่บันทึกข้อมูล
    endpoint: null,
    // ช่องทางติดต่อหลักที่ยืนยันแล้ว: 'phone' | 'email' | 'line'
    contactMethod: null,
    fields: { schoolLevel: false, parentContact: false },
    marketingConsent: false,
    group: { enabled: false, maxMembers: 5 },
    // วิธีชำระเงินที่ยืนยันแล้วเท่านั้น เช่น { label: 'โอนผ่านบัญชี…', detail: '…' }
    payment: null,
    // อธิบายว่าการยืนยันสิทธิ์เกิดขึ้นอย่างไร
    confirmation: null,
    steps: [
      'กรอกข้อมูลผู้สมัคร',
      'ตรวจสอบสรุปใบสมัคร',
      'ชำระเงินหรือยืนยันสิทธิ์ตามขั้นตอนที่ผู้จัดกำหนด',
      'รับรายละเอียดการเตรียมตัวและการเข้าร่วม',
    ],
    // ข้อความ "ขั้นตอนถัดไป" ตามสถานะที่ backend ส่งกลับ (backend ส่ง nextSteps มาแทนได้)
    nextSteps: {
      received: null,
      awaiting_payment: null,
      under_review: null,
      confirmed: null,
    },
  },

  // { label, href } — ช่องทางทางการของ Hamster Hub (ชุดเดียวกับ footer ของ hamsterhub.co)
  contact: {
    links: [
      { label: 'LINE @smart-school', href: 'https://page.line.me/jkm4247u?openQrModal=true' },
      { label: 'โทร 090-060-2555', href: 'tel:0900602555' },
      { label: 'Facebook Hamster Hub', href: 'https://www.facebook.com/HamsterHubThailand' },
      { label: 'Instagram hamsterhub_ig', href: 'https://www.instagram.com/hamsterhub_ig/' },
    ],
  },

  privacy: {
    confirmed: false, // true เมื่อผู้จัดตรวจและอนุมัติข้อความนโยบายแล้ว
    url: null, // ลิงก์นโยบายความเป็นส่วนตัวของเว็บหลัก (ใช้เมื่อฝังผ่าน host)
    controller: 'Hamster Hub',
    retention: null, // ระยะเวลาเก็บข้อมูล
    contact: null, // ช่องทางใช้สิทธิ์เจ้าของข้อมูล
  },

  about: {
    body: 'ค่าย 4 วัน เปลี่ยนจากคนเล่นเกม เป็นคนสร้างเกมของตัวเอง ด้วย Unity โดยมี AI เป็นผู้ช่วย',
    stages: [
      { title: 'คิดและออกแบบ', text: 'หาว่าเกมสนุกเพราะอะไร' },
      { title: 'สร้างและทดลอง', text: 'ทำตัวละครและระบบใน Unity' },
      { title: 'ทดสอบและนำเสนอ', text: 'ให้เพื่อนลองเล่น แล้วโชว์ผลงาน' },
    ],
  },

  systems: [
    {
      id: 'hero',
      word: 'HERO',
      tagline: 'ขยับได้ · มีสกิล · เป็นของเรา',
      title: 'ตัวละครและสกิล',
      text: 'ทำให้ตัวละครขยับได้ และใส่สกิลที่ชอบ',
      details: ['ฝึกสร้างตัวละครให้เคลื่อนไหว', 'ใส่ Skill ที่ชอบให้ตัวละคร', 'ฝึกเขียนโปรแกรมเบื้องต้น'],
    },
    {
      id: 'world',
      word: 'WORLD',
      tagline: 'วางด่าน · ปล่อยศัตรู · เอาตัวรอด',
      title: 'ด่านและศัตรู',
      text: 'ออกแบบแผนที่ แล้ววางศัตรูให้ท้าทาย',
      details: ['Storyboard & Map Design', 'ระบบ Enemy และบทบาทของศัตรูในเกม', 'ใช้ AI ช่วยทำงานใน Engine'],
    },
    {
      id: 'experience',
      word: 'PLAY',
      tagline: 'เล่นได้ · เท่ได้ · เป็นเกมจริง',
      title: 'กล้อง คัตซีน และ UI',
      text: 'ประกอบทุกอย่างให้เป็นเกมที่เล่นได้จริง',
      details: ['พัฒนา Gameplay ให้สนุกขึ้น', 'ประกอบทุกองค์ประกอบของเกม', 'ฝึกควบคุมมุมกล้อง', 'สร้าง Cutscene', 'ทำ UI และหน้าเมนูหลักของเกม'],
    },
  ],

  // ทักษะที่จะได้รับ — | คือจุดตัดบรรทัด (แต่ละช่วงจะไม่ถูกตัดกลางคำ)
  outcomes: [
    'การออกแบบ|Storyboard|และแผนที่เกม',
    'การพัฒนาเกม|ด้วย Unity',
    'การใช้ AI|ช่วยพัฒนาเกม',
    'การออกแบบสกิล|ของตัวละคร',
    'การสร้าง Cutscene',
    'การออกแบบ UI|และเมนูหลัก',
    'ทักษะการนำเสนอ|ผลงาน',
  ],

  // กำหนดการ 4 วัน — art = ภาพแฮมสเตอร์ประจำวันบนเส้นทาง
  // topic แบบ { text, pending: true } = หัวข้อที่ยังรอยืนยันรายละเอียด
  agenda: [
    {
      title: 'เกมสนุกได้เพราะอะไร',
      summary: 'ไอเดียเกม, Storyboard & Map Design และ Unity',
      art: 'astro-plan',
      topics: [
        'ลองออกแบบไอเดียเกมของตัวเอง',
        'เทคนิคที่จำเป็นในการพัฒนาเกม',
        'Storyboard & Map Design',
        'Unity Game Engine',
      ],
    },
    {
      title: 'ใช้ AI ช่วยทำงานใน Engine',
      summary: 'ตัวละคร Skill Enemy และเขียนโปรแกรมเบื้องต้น',
      art: 'astro-mic',
      topics: [
        'ฝึกสร้างตัวละครให้เคลื่อนไหว',
        'ใส่ Skill ที่ชอบให้ตัวละคร',
        'ระบบ Enemy และบทบาทของศัตรูในเกม',
        'ฝึกเขียนโปรแกรมเบื้องต้น',
      ],
    },
    {
      title: 'พัฒนา Gameplay ให้สนุกขึ้น',
      summary: 'กล้อง Cutscene UI และหน้าเมนูหลัก',
      art: 'astro-laptop',
      topics: [
        'ประกอบทุกองค์ประกอบของเกม',
        'ฝึกควบคุมมุมกล้อง',
        'สร้าง Cutscene',
        'ทำ UI และหน้าเมนูหลักของเกม',
      ],
    },
    {
      title: 'ปล่อยเกมให้เพื่อนได้ลอง',
      summary: 'เก็บรายละเอียดความรู้สึกตอนเล่น · ฝึกเทคนิคการนำเสนอ',
      art: 'astro-trophy',
      topics: [
        'ให้เพื่อนลองเล่นเกมของเรา',
        'โชว์ผลงาน',
        'รับคำแนะนำจากคณะกรรมการ',
        { text: 'ช่วงประกาศผล', pending: true },
        'After Party',
      ],
    },
  ],
};
