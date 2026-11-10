'use strict';

/**
 * Normalize Dutch postcode for Pandlens path segments.
 */
function normalizePostcode(postcode) {
  return String(postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/**
 * Trim house number for URL path (integer or string).
 */
function normalizeHuisnummer(huisnummer) {
  return String(huisnummer).trim();
}

function buildAddressPath(baseUrl, postcode, huisnummer, options) {
  const pc = encodeURIComponent(normalizePostcode(postcode));
  const num = encodeURIComponent(normalizeHuisnummer(huisnummer));
  let url = `${baseUrl}/v1/address/${pc}/${num}`;
  const params = new URLSearchParams();
  const opt = options || {};
  if (opt.huisletter) {
    params.set('huisletter', String(opt.huisletter).trim());
  }
  if (opt.toevoeging) {
    params.set('toevoeging', String(opt.toevoeging).trim());
  }
  const qs = params.toString();
  if (qs) {
    url += `?${qs}`;
  }
  return url;
}

module.exports = {
  normalizePostcode,
  normalizeHuisnummer,
  buildAddressPath,
};
