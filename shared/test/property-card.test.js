'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildPropertyCardModel } = require('../property-card.js');

const fixturePath = path.join(__dirname, '../../fixtures/address-enrichment.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

describe('buildPropertyCardModel', () => {
  it('maps registered energy label and buurt facts (NL)', () => {
    const model = buildPropertyCardModel(fixture, { lang: 'nl' });
    assert.equal(model.energy.kind, 'registered');
    assert.equal(model.energy.value, 'A');
    assert.ok(model.facts.some((row) => row.label === 'Bouwjaar' && row.value === '1998'));
    assert.ok(model.verdicts.some((v) => v.id === 'solar'));
    assert.match(model.credit, /CC BY 4.0/);
  });

  it('marks derived-only label as estimate', () => {
    const payload = JSON.parse(JSON.stringify(fixture));
    delete payload.energyLabel;
    payload.derived.energy.labelClass = { value: 'C', status: 'computed' };
    const model = buildPropertyCardModel(payload, { lang: 'en' });
    assert.equal(model.energy.kind, 'estimate');
    assert.equal(model.energy.kindLabel, 'Estimated label');
  });

  it('prefers API installation verdict strings when present', () => {
    const payload = JSON.parse(JSON.stringify(fixture));
    payload.derived.installation = {
      solarVerdict: 'Roof suitable for extra panels',
      insulationVerdict: 'Cavity wall likely insulated',
    };
    const model = buildPropertyCardModel(payload, { lang: 'en' });
    assert.equal(model.verdicts.find((v) => v.id === 'solar').text, 'Roof suitable for extra panels');
    assert.equal(model.verdicts.find((v) => v.id === 'insulation').text, 'Cavity wall likely insulated');
  });
});
