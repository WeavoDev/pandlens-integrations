'use strict';

const authentication = require('./authentication');
const enrichAddress = require('./creates/enrich_address');
const getEnergyLabel = require('./creates/get_energy_label');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  flags: {
    skipThrowForStatus: true,
  },
  authentication,
  beforeRequest: [
    (request, z, bundle) => {
      request.headers = request.headers || {};
      if (bundle.authData?.apiKey) {
        request.headers['X-Api-Key'] = bundle.authData.apiKey;
      }
      return request;
    },
  ],
  creates: {
    [enrichAddress.key]: enrichAddress,
    [getEnergyLabel.key]: getEnergyLabel,
  },
};
