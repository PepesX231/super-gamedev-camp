#!/usr/bin/env python3
"""เซิร์ฟเวอร์สำหรับพัฒนา: เสิร์ฟไฟล์ static และมี mock API ไว้ทดสอบฟอร์มสมัครเท่านั้น

    python3 dev_server.py            ->  http://localhost:4321/superdev/index.html
                                         http://localhost:4321/host-test  (จำลองการฝังในเว็บหลัก)

mock API (POST /__mock/registrations) ไม่บันทึกข้อมูลลงดิสก์และไม่ใช่ระบบรับสมัครจริง
ใช้ทดสอบโดยตั้ง enrollment.endpoint ใน config.js เป็น '/__mock/registrations' ชั่วคราว
- ชื่อที่มีคำว่า "FAIL"   -> ตอบ 500 ครั้งแรก แล้วสำเร็จเมื่อส่งซ้ำ (ทดสอบ retry)
- ชื่อที่มีคำว่า "REJECT" -> ตอบ 422 พร้อม error รายช่อง
"""
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))

PORT = 4321

HOST_TEST = """<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>host test</title>
<style>html,body{margin:0;height:100%;background:#000}iframe{display:block;width:100%;height:100dvh;border:0}
dialog{font:16px sans-serif;padding:24px;border-radius:16px;border:0}dialog::backdrop{background:rgb(0 0 0/.7)}</style>
<iframe id="f" src="/superdev-site/index.html" title="Super GameDev Camp"></iframe>
<dialog id="d"><p>host: ได้รับสัญญาณเปิดฟอร์มสมัคร <b id="n">0</b> ครั้ง</p><button onclick="d.close()">ปิด</button></dialog>
<script>
addEventListener('message', function (e) {
  if (e.origin !== location.origin || e.source !== f.contentWindow) return;
  if (e.data && e.data.type === 'hh-superdev:register') { n.textContent = +n.textContent + 1; d.showModal(); }
});
</script></html>"""
saved = {}   # Idempotency-Key -> response
failed = set()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # เสิร์ฟจากโฟลเดอร์ของสคริปต์เสมอ ไม่ขึ้นกับตำแหน่งที่สั่งรัน
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def translate_path(self, path):
        # เว็บหลักวางไฟล์ชุดนี้ไว้ที่ /superdev-site/ — จำลอง path เดียวกันเพื่อทดสอบโหมดฝัง
        if path.startswith('/superdev-site/'):
            path = '/superdev/' + path[len('/superdev-site/'):]
        return super().translate_path(path)

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.send_response(302)
            self.send_header('Location', '/superdev/index.html')
            self.end_headers()
            return
        if self.path.split('?')[0] == '/host-test':
            # จำลองหน้า /superdev ของเว็บหลัก: ฝังเว็บด้วย iframe และรับสัญญาณเปิดฟอร์มสมัคร
            body = HOST_TEST.encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def reply(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != '/__mock/registrations':
            return self.reply(404, {'error': 'not found'})
        key = self.headers.get('Idempotency-Key')
        try:
            body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
            people = body['participants']
        except (ValueError, KeyError, TypeError):
            return self.reply(400, {'error': 'bad request'})
        if not key:
            return self.reply(400, {'error': 'missing Idempotency-Key'})
        if key in saved:
            return self.reply(200, saved[key])
        errors = {}
        for i, p in enumerate(people):
            name = str(p.get('fullName', '')).strip()
            if len(name) < 2:
                errors[f'participants.{i}.fullName'] = 'กรอกชื่อ–นามสกุล'
            elif 'REJECT' in name:
                errors[f'participants.{i}.fullName'] = 'ชื่อนี้ถูกปฏิเสธโดยระบบทดสอบ'
        if len(str(body.get('contact', {}).get('value', '')).strip()) < 2:
            errors['contact'] = 'กรอกช่องทางติดต่อ'
        if errors:
            return self.reply(422, {'errors': errors})
        if any('FAIL' in p['fullName'] for p in people) and key not in failed:
            failed.add(key)
            return self.reply(500, {'error': 'simulated failure'})
        saved[key] = {'reference': f'MOCK-{len(saved) + 1:04d}', 'status': 'received'}
        self.reply(201, saved[key])


if __name__ == '__main__':
    print(f'http://localhost:{PORT}/superdev/index.html')
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
