import config from './config.js';

// three.js โหลดจาก CDN เมื่อจำเป็นเท่านั้น (แบบเดียวกับเว็บ All for One) — โหลดไม่ได้ก็ยังเห็นเนื้อหาครบ
const THREE_URL = config.threeUrl || 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

let three;
export const loadThree = () => (three ??= import(THREE_URL));

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = matchMedia('(pointer: coarse)').matches;
export const saveData = Boolean(navigator.connection?.saveData);

let gl;
export function webglOK() {
  if (gl !== undefined) return gl;
  try {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('webgl2') || cv.getContext('webgl');
    ctx?.getExtension('WEBGL_lose_context')?.loseContext();
    gl = Boolean(ctx);
  } catch {
    gl = false;
  }
  return gl;
}
