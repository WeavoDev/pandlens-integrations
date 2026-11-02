'use strict';

const SKIP_KEYS = new Set(['footprintGeoJson']);

/**
 * Flatten nested API JSON into Zapier/n8n-friendly fields (underscore paths).
 * Skips null/undefined, large geometry blobs, and empty objects.
 */
function flattenObject(value, prefix, out) {
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
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return;
  }
  for (const key of keys) {
    if (SKIP_KEYS.has(key)) {
      continue;
    }
    const next = prefix ? `${prefix}_${key}` : key;
    flattenObject(value[key], next, out);
  }
}

function flattenEnrichment(body) {
  const out = {};
  if (!body || typeof body !== 'object') {
    return out;
  }
  for (const section of ['address', 'bag', 'energyLabel', 'neighbourhood']) {
    if (body[section] !== undefined) {
      flattenObject(body[section], section, out);
    }
  }
  return out;
}

function flattenEnergyOnly(body) {
  const out = {};
  if (body?.energyLabel) {
    flattenObject(body.energyLabel, 'energyLabel', out);
  }
  return out;
}

module.exports = {
  flattenEnrichment,
  flattenEnergyOnly,
  flattenObject,
};
