'use strict';

const assert = require('node:assert/strict');
const { flattenEnrichment, flattenEnergyOnly } = require('../../shared/flatten');
const addressFixture = require('../../fixtures/address-enrichment.json');

assert.equal(flattenEnrichment(addressFixture).address_straat, 'Markt');
assert.equal(flattenEnergyOnly(addressFixture).energyLabel_labelClass, 'A');

console.log('n8n shared flatten tests passed');
