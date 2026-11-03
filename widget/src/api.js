import { normalizePostcode } from './postcode.js';

const DEFAULT_BASE = 'https://api.pandlens.nl';

export function buildWidgetUrl(base, parts) {
  const postcode = normalizePostcode(parts.postcode);
  const huisnummer = String(parts.huisnummer || '').replace(/\D/g, '');
  const url = new URL(
    `/v1/widget/address/${encodeURIComponent(postcode)}/${encodeURIComponent(huisnummer)}`,
    base || DEFAULT_BASE,
  );
  if (parts.huisletter) {
    url.searchParams.set('huisletter', String(parts.huisletter).trim());
  }
  if (parts.toevoeging) {
    url.searchParams.set('toevoeging', String(parts.toevoeging).trim());
  }
  return url.toString();
}

export async function fetchProperty(base, widgetKey, parts, options = {}) {
  if (options.mockPayload) {
    return { ok: true, status: 200, body: options.mockPayload };
  }

  const response = await fetch(buildWidgetUrl(base, parts), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Widget-Key': widgetKey,
    },
    credentials: 'omit',
    mode: 'cors',
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { ok: response.ok, status: response.status, body };
}
