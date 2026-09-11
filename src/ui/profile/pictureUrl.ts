export function safePicture(value: string) {
  if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}
