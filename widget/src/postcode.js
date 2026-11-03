export function normalizePostcode(postcode) {
  return String(postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
}
