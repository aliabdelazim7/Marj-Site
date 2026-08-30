export const MAX_PRODUCT_MODEL_BYTES = 12 * 1024 * 1024;

export function isDirectModelUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed, "https://marj.local");
    return /\.(glb|gltf)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function validateGlbUpload(fileName: string, bytes: Uint8Array): string | null {
  if (!/\.glb$/i.test(fileName)) return "ارفع ملف GLB فقط. روابط الصفحات أو صور 3D لا تعمل داخل العارض.";
  if (bytes.byteLength > MAX_PRODUCT_MODEL_BYTES) return "حجم ملف GLB أكبر من 12MB. قلّل حجم النموذج والـ textures ثم أعد المحاولة.";
  if (bytes.byteLength < 20) return "ملف GLB غير مكتمل أو تالف.";
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0x46546c67) return "الملف ليس نموذج GLB صالحًا.";
  if (view.getUint32(4, true) !== 2) return "استخدم GLB بإصدار glTF 2.0.";
  if (view.getUint32(8, true) !== bytes.byteLength) return "ملف GLB غير مكتمل أو تالف.";
  return null;
}
