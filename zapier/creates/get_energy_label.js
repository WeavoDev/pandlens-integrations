'use strict';

const { API_BASE_URL } = require('../../shared/constants');
const { assertOkStatus } = require('../../shared/errors');
const { flattenEnergyOnly } = require('../../shared/flatten');

const buildAddressPath = (postcode, huisnummer, query) => {
  const pc = String(postcode || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  const num = encodeURIComponent(String(huisnummer).trim());
  const params = new URLSearchParams({ include: 'energy' });
  if (query.huisletter) {
    params.set('huisletter', query.huisletter);
  }
  if (query.toevoeging) {
    params.set('toevoeging', query.toevoeging);
  }
  return `${API_BASE_URL}/v1/address/${encodeURIComponent(pc)}/${num}?${params.toString()}`;
};

module.exports = {
  key: 'get_energy_label',
  noun: 'Energy Label',
  display: {
    label: 'Get Energy Label',
    description:
      'Look up the registered energy label for one Dutch address. Returns label class, validity dates, and primary energy use figures.',
  },
  operation: {
    inputFields: [
      {
        key: 'postcode',
        label: 'Postcode',
        required: true,
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
      },
    ],
    perform: async (z, bundle) => {
      const url = buildAddressPath(bundle.inputData.postcode, bundle.inputData.huisnummer, bundle.inputData);
      const response = await z.request({ url });
      assertOkStatus(response.status, response.content, z);
      return flattenEnergyOnly(response.json);
    },
    sample: require('../../fixtures/energy-label-flat.sample.json'),
  },
};
