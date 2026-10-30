'use strict';

const { API_BASE_URL } = require('../../shared/constants');
const { assertOkStatus } = require('../../shared/errors');
const { flattenEnrichment } = require('../../shared/flatten');

const buildAddressPath = (postcode, huisnummer, query) => {
  const pc = String(postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  const num = encodeURIComponent(String(huisnummer).trim());
  let url = `${API_BASE_URL}/v1/address/${encodeURIComponent(pc)}/${num}`;
  const params = new URLSearchParams();
  if (query.huisletter) {
    params.set('huisletter', query.huisletter);
  }
  if (query.toevoeging) {
    params.set('toevoeging', query.toevoeging);
  }
  const qs = params.toString();
  if (qs) {
    url += `?${qs}`;
  }
  return url;
};

module.exports = {
  key: 'enrich_address',
  noun: 'Address',
  display: {
    label: 'Enrich Address',
    description:
      'Look up one Dutch address by postcode and house number. Returns flat fields for the street address, building size and year, registered energy label, and neighbourhood averages.',
  },
  operation: {
    inputFields: [
      {
        key: 'postcode',
        label: 'Postcode',
        required: true,
        helpText: 'Dutch postcode, with or without a space (for example 1012JS or 1012 JS).',
      },
      {
        key: 'huisnummer',
        label: 'House number',
        required: true,
        type: 'integer',
      },
      {
        key: 'huisletter',
        label: 'House letter',
        required: false,
      },
      {
        key: 'toevoeging',
        label: 'House number suffix',
        required: false,
        helpText: 'Optional suffix (toevoeging), for example bis or III.',
      },
    ],
    perform: async (z, bundle) => {
      const url = buildAddressPath(bundle.inputData.postcode, bundle.inputData.huisnummer, bundle.inputData);
      const response = await z.request({ url });
      assertOkStatus(response.status, response.content, z);
      return flattenEnrichment(response.json);
    },
    sample: require('../../fixtures/address-enrichment-flat.sample.json'),
  },
};
