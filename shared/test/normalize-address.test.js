'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizePostcode, buildAddressPath } = require('../normalize-address');
const { API_BASE_URL } = require('../constants');

describe('normalize-address', () => {
  it('strips spaces and uppercases postcode', () => {
    assert.equal(normalizePostcode('1012 js'), '1012JS');
  });

  it('builds address URL with optional query', () => {
    const url = buildAddressPath(API_BASE_URL, '6101DB', 19, {
      huisletter: 'a',
      toevoeging: 'bis',
    });
    assert.match(url, /^https:\/\/api\.pandlens\.nl\/v1\/address\/6101DB\/19\?/);
    assert.match(url, /huisletter=a/);
    assert.match(url, /toevoeging=bis/);
  });
});
