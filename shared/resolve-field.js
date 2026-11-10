'use strict';

/**
 * Read one value from a flattened enrichment object (Zapier-style underscore paths).
 * Field names are matched case-insensitively.
 */
function resolveFlatField(flat, fieldName) {
  if (!flat || typeof flat !== 'object' || fieldName === null || fieldName === undefined) {
    return '';
  }
  const key = String(fieldName).trim();
  if (!key) {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(flat, key)) {
    const value = flat[key];
    return value === null || value === undefined ? '' : value;
  }
  const lower = key.toLowerCase();
  for (const candidate of Object.keys(flat)) {
    if (candidate.toLowerCase() === lower) {
      const value = flat[candidate];
      return value === null || value === undefined ? '' : value;
    }
  }
  return '';
}

module.exports = {
  resolveFlatField,
};
