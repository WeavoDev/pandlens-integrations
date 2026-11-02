'use strict';

const assert = require('node:assert/strict');
const { flattenEnrichment, flattenEnergyOnly } = require('../flatten');
const addressFixture = require('../../fixtures/address-enrichment.json');

assert.equal(flattenEnrichment(addressFixture).address_straat, 'Markt');
assert.equal(flattenEnergyOnly(addressFixture).energyLabel_labelClass, 'A');

console.log('shared flatten tests passed');
