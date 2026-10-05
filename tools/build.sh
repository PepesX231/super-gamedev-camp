#!/bin/sh
# รวมสคริปต์ของเว็บเป็นไฟล์เดียวต่อหน้า (*.bundle.js) — ทำให้ดับเบิลคลิกเปิด index.html ได้โดยไม่ต้องมีเซิร์ฟเวอร์
# รันทุกครั้งหลังแก้ไฟล์ .js ใน superdev/assets (ต้องมี Node.js)
cd "$(dirname "$0")/../superdev" || exit 1
for n in landing register privacy; do
  npx --yes esbuild@0.24.0 "assets/$n.js" --bundle --format=iife --minify --target=es2020 --outfile="assets/$n.bundle.js" --log-level=warning
done
echo "built: superdev/assets/*.bundle.js"
