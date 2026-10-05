#!/bin/sh
# คัดลอกเว็บ static ชุดนี้ไปยังเว็บหลัก Hamster Hub (profile_HH/public/superdev-site)
# ใช้:  sh tools/sync_to_profile_hh.sh [path ของโปรเจค profile_HH]
# ไม่คัดลอกหน้าสมัคร/หน้าความเป็นส่วนตัวแบบ static เพราะเว็บหลักใช้ระบบรับสมัครของตัวเอง
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${1:-$ROOT/../profile_HH}"
DEST="$HOST/public/superdev-site/"
[ -d "$HOST/public" ] || { echo "ไม่พบโปรเจคเว็บหลักที่ $HOST" >&2; exit 1; }
rsync -a --delete --delete-excluded \
  --exclude '._*' --exclude '.DS_Store' \
  --exclude '/register/' --exclude '/privacy/' \
  --exclude '/assets/register.js' --exclude '/assets/privacy.js' \
  "$ROOT/superdev/" "$DEST"
# ไดรฟ์ exFAT สร้างไฟล์ ._* ตามมา ลบออกเพื่อไม่ให้ติดไปกับ git
find "$DEST" -name '._*' -delete
echo "คัดลอกแล้ว -> $DEST"
find "$DEST" -type f | sort
