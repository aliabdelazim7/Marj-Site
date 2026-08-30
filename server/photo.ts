const PHOTO_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,([a-zA-Z0-9+/=]+)$/;

export function parsePhotoDataUrl(value: string) {
  const match = value.match(PHOTO_DATA_URL_PATTERN);
  if (!match) throw new Error("صيغة الصورة غير مدعومة");
  return { mimeType: `image/${match[1] === "jpg" ? "jpeg" : match[1]}`, encoded: match[2] };
}
