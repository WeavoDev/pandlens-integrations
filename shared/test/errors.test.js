'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  mapPandlensHttpError,
  formatAmbiguousCandidates,
  rateLimitHint,
} = require('../errors');
const notFoundFixture = require('../../fixtures/errors/address-not-found.json');
const ambiguousFixture = require('../../fixtures/errors/address-ambiguous.json');

describe('Pandlens HTTP error mapping', () => {
  it('maps address_not_found JSON', () => {
    assert.throws(
      () => mapPandlensHttpError(404, JSON.stringify(notFoundFixture), null, {}),
      (err) => err.message.includes('No property was found'),
    );
  });

  it('maps address_ambiguous JSON with candidates', () => {
    assert.throws(
      () => mapPandlensHttpError(409, JSON.stringify(ambiguousFixture), null, {}),
      (err) => err.message.includes('more than one address') && err.message.includes('1012JS'),
    );
  });

  it('formats rate limit reset hint from X-RateLimit-Reset', () => {
    const reset = Math.floor(Date.now() / 1000) + 30;
    const hint = rateLimitHint({ 'X-RateLimit-Reset': String(reset) });
    assert.match(hint, /Try again in about/);
  });

  it('formats ambiguous candidate list', () => {
    const text = formatAmbiguousCandidates(ambiguousFixture.candidates);
    assert.match(text, /1012JS 1 A/);
  });
});
