/** HTTP client, cache, and flattening for Pandlens address lookups. */

var PANDLENS_LAST_CALL_MS = 'PANDLENS_LAST_CALL_MS';

/**
 * Flatten API JSON (keep in sync with shared/flatten.js).
 */
function pandlensFlattenEnrichment(body) {
  var out = {};
  if (!body || typeof body !== 'object') {
    return out;
  }
  var sections = ['address', 'bag', 'energyLabel', 'neighbourhood'];
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    if (body[section] !== undefined) {
      pandlensFlattenObject(body[section], section, out);
    }
  }
  return out;
}

function pandlensFlattenObject(value, prefix, out) {
  if (value === null || value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    out[prefix] = JSON.stringify(value);
    return;
  }
  if (typeof value !== 'object') {
    out[prefix] = value;
    return;
  }
  var keys = Object.keys(value);
  if (keys.length === 0) {
    return;
  }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === 'footprintGeoJson') {
      continue;
    }
    var next = prefix ? prefix + '_' + key : key;
    pandlensFlattenObject(value[key], next, out);
  }
}

function pandlensNormalizePostcode(postcode) {
  return String(postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

function pandlensCacheGeneration_() {
  return PropertiesService.getDocumentProperties().getProperty('PANDLENS_CACHE_GEN') || '0';
}

function pandlensCacheKey(postcode, huisnummer, huisletter, toevoeging) {
  var parts = [
    pandlensCacheGeneration_(),
    pandlensNormalizePostcode(postcode),
    String(huisnummer).trim(),
    String(huisletter || '').trim().toLowerCase(),
    String(toevoeging || '').trim().toLowerCase(),
  ];
  return 'pl:' + parts.join('|');
}

function pandlensThrottle_() {
  var docProps = PropertiesService.getDocumentProperties();
  var last = Number(docProps.getProperty(PANDLENS_LAST_CALL_MS) || 0);
  var now = Date.now();
  var elapsed = now - last;
  if (elapsed < PANDLENS_MIN_INTERVAL_MS) {
    Utilities.sleep(PANDLENS_MIN_INTERVAL_MS - elapsed);
  }
  docProps.setProperty(PANDLENS_LAST_CALL_MS, String(Date.now()));
}

function pandlensFetchEnrichment(postcode, huisnummer, huisletter, toevoeging) {
  var apiKey = pandlensGetApiKey();
  if (!apiKey) {
    throw new Error('Set your Pandlens API key from the Pandlens menu.');
  }

  var cache = CacheService.getDocumentCache();
  var cacheKey = pandlensCacheKey(postcode, huisnummer, huisletter, toevoeging);
  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  pandlensThrottle_();

  var pc = encodeURIComponent(pandlensNormalizePostcode(postcode));
  var num = encodeURIComponent(String(huisnummer).trim());
  var url = PANDLENS_API_BASE + '/v1/address/' + pc + '/' + num;
  var query = [];
  if (huisletter) {
    query.push('huisletter=' + encodeURIComponent(String(huisletter).trim()));
  }
  if (toevoeging) {
    query.push('toevoeging=' + encodeURIComponent(String(toevoeging).trim()));
  }
  if (query.length) {
    url += '?' + query.join('&');
  }

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'X-Api-Key': apiKey,
      Accept: 'application/json',
    },
  });

  var status = response.getResponseCode();
  var text = response.getContentText();

  if (status === 429) {
    throw new Error('Pandlens rate limit exceeded. Wait and try again.');
  }
  if (status === 401 || status === 403) {
    throw new Error('Invalid Pandlens API key.');
  }
  if (status === 402) {
    throw new Error('Pandlens monthly lookup limit reached.');
  }
  if (status === 404) {
    throw new Error('No property was found for this address.');
  }
  if (status < 200 || status >= 300) {
    throw new Error('Pandlens lookup failed (HTTP ' + status + ').');
  }

  var body = JSON.parse(text);
  cache.put(cacheKey, JSON.stringify(body), PANDLENS_CACHE_TTL_SEC);
  return body;
}

function pandlensResolveField(flat, fieldName) {
  if (!flat || !fieldName) {
    return '';
  }
  var key = String(fieldName).trim();
  if (!key) {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(flat, key)) {
    var direct = flat[key];
    return direct === null || direct === undefined ? '' : direct;
  }
  var lower = key.toLowerCase();
  var keys = Object.keys(flat);
  for (var i = 0; i < keys.length; i++) {
    var candidate = keys[i];
    if (candidate.toLowerCase() === lower) {
      var value = flat[candidate];
      return value === null || value === undefined ? '' : value;
    }
  }
  return '';
}
