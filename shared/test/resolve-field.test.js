'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveFlatField } = require('../resolve-field');
const { flattenEnrichment } = require('../flatten');
const fixture = require('../../fixtures/address-enrichment.json');

describe('resolveFlatField', () => {
  const flat = flattenEnrichment(fixture);

  it('reads exact keys', () => {
    assert.equal(resolveFlatField(flat, 'energyLabel_labelClass'), 'A');
  });

  it('matches case-insensitively', () => {
    assert.equal(resolveFlatField(flat, 'address_straat'), 'Markt');
    assert.equal(resolveFlatField(flat, 'ADDRESS_STRAAT'), 'Markt');
  });

  it('returns empty for unknown fields', () => {
    assert.equal(resolveFlatField(flat, 'does_not_exist'), '');
  });
});
