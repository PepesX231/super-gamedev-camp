# Super GameDev Camp — เว็บไซต์ค่าย

เว็บ static ธีมอวกาศ ไม่มีขั้นตอน build และไม่มี dependency ที่ต้องติดตั้ง
โฟลเดอร์ `superdev/` คือตัวเว็บ และถูกนำไปฝังในเว็บหลัก Hamster Hub (โปรเจค `profile_HH`) ที่ `hamsterhub.co/superdev`

```
superdev/
  index.html             หน้าหลัก (โครง + meta) เนื้อหาสร้างจาก assets/landing.js
  register/ privacy/     หน้าสมัครตัวอย่างและหน้าความเป็นส่วนตัว — ใช้เฉพาะตอนเปิดแบบ static ล้วน
  assets/
    config.js            ⭐ ข้อมูลค่ายทั้งหมด แก้ที่นี่ที่เดียว
    styles.css           สไตล์ทั้งหมด (สารบัญอยู่บนสุดของไฟล์)
    core.js              header/footer, สถานะ preview, สะพานปุ่มสมัครไปยังเว็บหลัก
    landing.js           แต่ละ section ของหน้าหลัก
    scene.js             ฉากอวกาศของส่วนบนสุด (SVG/CSS ล้วน): ดาวเคราะห์ อุกกาบาต ภูมิประเทศ voxel อุปกรณ์คอมร่วงลงมา และ UFO
    cosmos.js            ของตกแต่งอวกาศ: อุปกรณ์คอมลอย/ร่วง (โน้ตบุ๊ก เมาส์ จอ จอยเกม คีย์บอร์ด แผ่นซีดี), UFO, กาแล็กซี และหลุมดำ
    fx.js                เอฟเฟกต์ตอนเลื่อนและตามเมาส์, ปุ่มสมัครบน header, หยุดแอนิเมชันนอกจอ
    models.js            โมเดล 3D ของสามระบบ — จุดเดียวที่ใช้ three.js (ใช้ไม่ได้ → เห็นภาพแฮมสเตอร์ 2D แทน)
    gfx.js               ตัวโหลด three.js และสถานะอุปกรณ์
    art.js               ฉากหลัง SVG ของการ์ดสามระบบ (ภาพสำรองเมื่อใช้ 3D ไม่ได้)
    img/logo.webp        โลโก้ค่าย (ใช้ในฉากบนสุด, header, ตั๋ว, footer)
    img/hero.webp        ภาพหลักของค่าย — ใช้เป็นภาพตอนแชร์ลิงก์ (og:image) เท่านั้น
    img/hamster-astro-*.webp  แฮมสเตอร์ชุดอวกาศ 12 ท่า และ img/emoji-*.webp อิโมจิ 8 ตัว (เจนด้วย Canva AI ตัดพื้นหลังแล้ว)
    sizes.js             ขนาดจริงของภาพแฮมสเตอร์แต่ละไฟล์
    media/               เทรลเลอร์และภาพจากเกม COMMAND SELECT (ผลงานจากค่ายครั้งก่อน) — ใช้ใน section “ผลงานรุ่นก่อน”
dev_server.py            เซิร์ฟเวอร์ทดสอบในเครื่อง
tools/sync_to_profile_hh.sh   คัดลอกเว็บไปยัง profile_HH
```

## ขึ้นออนไลน์ด้วย GitHub Pages

1. อัปโหลดทั้งโฟลเดอร์นี้ขึ้น repo บน GitHub (ไฟล์ `index.html` ที่ราก repo จะพาไปหน้า `superdev/` เอง)
2. ไปที่ Settings → Pages → Build and deployment เลือก **Deploy from a branch** → branch `main` โฟลเดอร์ `/ (root)` แล้วกด Save
3. รอสักครู่ เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/<ชื่อ repo>/`

ไฟล์ `.nojekyll` มีไว้ให้ GitHub ส่งไฟล์ตามที่เป็น ไม่ต้องลบ
บน GitHub Pages ปุ่มสมัครจะเปิดหน้า `register/` ของชุดนี้ (ฟอร์มตัวอย่าง ไม่บันทึกข้อมูล) — การสมัครจริงยังอยู่ที่ hamsterhub.co/superdev

## ดูเว็บในเครื่อง

```bash
python3 dev_server.py
```

- http://localhost:4321/superdev/index.html — เปิดแบบหน้าเดี่ยว
- http://localhost:4321/host-test — จำลองการฝังในเว็บหลัก (กดปุ่มสมัครแล้วหน้าจำลองจะรับสัญญาณ)

ดับเบิลคลิก `superdev/index.html` เปิดดูได้เลย เพราะหน้าเว็บโหลดสคริปต์ที่รวมเป็นไฟล์เดียว (`assets/*.bundle.js`)

**แก้ไฟล์ .js ใน `superdev/assets` แล้วต้องรัน `sh tools/build.sh` ทุกครั้ง** (ต้องมี Node.js) ไม่อย่างนั้นหน้าเว็บจะยังใช้สคริปต์ชุดเก่า

## แก้ข้อมูลค่าย

แก้ที่ `superdev/assets/config.js` แล้วรีเฟรช

- ค่าที่เป็น `null` / array ว่าง = ยังไม่ยืนยัน โหมด `preview` แสดงป้าย “รอยืนยันรายละเอียด” ส่วนโหมด `live` จะซ่อน
- แถบสีส้มบนสุดบอกสองกลุ่ม: **ต้องยืนยันก่อนเปิดจริง** (การจัด 2 ช่วงเวลา, รูปแบบการจัด, กลุ่มผู้เข้าร่วม, สเปกคอมพิวเตอร์) และข้อมูลเสริมที่ยังว่าง
- ตั้ง `mode: 'live'` เมื่อกลุ่มแรกครบ ถ้ายังไม่ครบเว็บจะแสดงแบบ preview ต่อไปเอง
- section ผู้สอน (`instructors`) และผลงาน/รีวิว (`evidence`) แสดงเมื่อมีข้อมูลจริงเท่านั้น
- section “ผลงานรุ่นก่อน” มาจาก `showcase` (ชื่อเกม คำอธิบาย เครดิต ลิงก์ วิดีโอ ภาพ) ตั้ง `showcase: null` เพื่อซ่อน
  วิดีโอโหลดเมื่อกดเล่นเท่านั้น (`preload="none"`) และหยุดเองเมื่อเลื่อนพ้นจอ
- นับถอยหลังแสดงเมื่อใส่ `registration.deadline` (ISO พร้อม `+07:00`)
- กำหนดการ `agenda` ใช้ถ้อยคำตามบรีฟของค่าย แต่ละวันมี `art` = ชื่อภาพแฮมสเตอร์บนเส้นทาง Mission Map (astro-plan / astro-mic / astro-laptop / astro-trophy)
- ช่องทางติดต่อใน `contact.links` ใช้ชุดเดียวกับ footer ของ hamsterhub.co

## นำขึ้นเว็บหลัก (profile_HH)

```bash
sh tools/sync_to_profile_hh.sh
```

สคริปต์คัดลอก `superdev/` ไปที่ `profile_HH/public/superdev-site/` (ไม่รวมหน้าสมัคร/ความเป็นส่วนตัวแบบ static)
ฝั่ง `profile_HH` มี route `src/app/superdev/` ที่ฝังเว็บนี้ด้วย iframe ตามแบบเดียวกับ `/allforone` — ดู `src/app/superdev/README.md`

- ปุ่ม “สมัครเข้าค่าย” ทุกปุ่มส่งสัญญาณ `hh-superdev:register` ให้เว็บหลักเปิดฟอร์มสมัครของระบบเดิม
- การรับสมัคร ราคา และการชำระเงินเป็นของ **คอร์สในระบบหลังบ้านที่มี href `/superdev`** ต้องสร้างและเผยแพร่คอร์สนี้ใน `/admin/courses` ก่อน ไม่อย่างนั้นปุ่มสมัครจะแจ้งว่ายังไม่เปิดรับสมัคร
- ราคาที่แสดงบนหน้าเว็บมาจาก `config.js` ต้องตั้งให้ตรงกับคอร์สในระบบ
- เปิด `/superdev-site/...` ตรง ๆ บนเว็บหลักจะถูกพาไป `/superdev`
- ถ้าจะวางเว็บนี้ที่อื่นแบบ static ล้วน ให้ตั้ง `host: null` ใน `config.js` แล้วใช้หน้า `register/` (ต้องมี backend ตามสัญญาด้านล่าง)

## เอฟเฟกต์และประสิทธิภาพ

ออกแบบให้เบา: ไม่มีฉาก 3D และไม่มีอะไรทำงานต่อเนื่องเมื่อมองไม่เห็น

- ฉากบนสุดและพื้นหลังเป็น SVG/CSS ขยับด้วย transform/opacity เท่านั้น พื้นหลังทั้งหน้าเป็นภาพนิ่ง
- แอนิเมชันของส่วนที่เลื่อนพ้นจอถูกหยุด (class `is-off`)
- three.js โหลดเมื่อเลื่อนใกล้ส่วน “สามระบบ” เท่านั้น ถ้าโหลดไม่ได้จะเห็นภาพแฮมสเตอร์ 2D ในการ์ดแทน
- พื้นหลังจักรวาลวาดลง canvas ครั้งเดียว (cosmos.js `paintStarfield`) ไม่คำนวณทุกเฟรม
- Mission Map: กดแฮมสเตอร์แต่ละวันเพื่อเปิดหน้าต่างรายละเอียด (ใช้ `<dialog>`)
- “ลดการเคลื่อนไหว” ของระบบ → ปิดแอนิเมชันทั้งหมด

## ปุ่มสมัคร

ทั้งหน้ามีจุดสมัครหลัก 2 จุด คือฉากบนสุดและส่วน “สมัครเข้าค่าย” ท้ายหน้า
ปุ่มบน header จะแสดงเฉพาะตอนที่ไม่มีปุ่มสมัครหลักอยู่ในจอ ผู้ชมจึงเห็นปุ่มสมัครทีละปุ่มเสมอ

## ฟอร์มสมัครแบบ static (ใช้เมื่อ `host: null`)

ไม่มี backend ในชุดนี้ (`enrollment.endpoint: null`) ฟอร์มจะตรวจรูปแบบและแสดงหน้าสรุป แต่ไม่ส่งและไม่บันทึกข้อมูล
เมื่อมี backend ให้ใส่ URL ใน `enrollment.endpoint` โดยทำตามสัญญานี้

```
POST <endpoint>
Content-Type: application/json
Idempotency-Key: <uuid>      # ส่งซ้ำด้วย key เดิมต้องคืนผลเดิม ห้ามสร้างรายการใหม่

{ "participants": [{ "fullName": "", "nickname": "", "schoolLevel": "" }],
  "contact": { "method": "phone|email|line", "value": "" },
  "parentContact": "", "slot": "", "marketingConsent": false }

201/200 -> { "reference": "SGC-0001",
             "status": "received|awaiting_payment|under_review|confirmed",
             "nextSteps": "ข้อความ (ไม่บังคับ)" }
422     -> { "errors": { "participants.0.fullName": "ข้อความ", "contact": "ข้อความ" } }
```

`dev_server.py` มี mock API ที่ `/__mock/registrations` ไว้ทดสอบฟอร์มในเครื่องเท่านั้น (ไม่บันทึกข้อมูล)
ชื่อที่มี `FAIL` จะล้มเหลวครั้งแรก ชื่อที่มี `REJECT` จะได้ 422
