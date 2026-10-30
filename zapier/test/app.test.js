'use strict';

const should = require('should');
const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../index');
const { flattenEnrichment } = require('../../shared/flatten');
const addressFixture = require('../../fixtures/address-enrichment.json');
const usageFixture = require('../../fixtures/usage.json');

const appTester = zapier.createAppTester(App);

describe('Pandlens Zapier app', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('authenticates with GET /v1/usage', async () => {
    nock('https://api.pandlens.nl').get('/v1/usage').reply(200, usageFixture);
    const result = await appTester(App.authentication.test, {
      authData: { apiKey: 'test-key' },
    });
    result.plan.should.eql('FREE');
    result.usedThisMonth.should.eql(3);
  });

  it('maps 401 on auth test', async () => {
    nock('https://api.pandlens.nl').get('/v1/usage').reply(401, 'Unauthorized');
    try {
      await appTester(App.authentication.test, { authData: { apiKey: 'bad' } });
      throw new Error('expected failure');
    } catch (err) {
      err.message.should.match(/invalid or missing/i);
    }
  });

  it('enriches one address from fixture shape', async () => {
    nock('https://api.pandlens.nl')
      .get('/v1/address/6101DB/19')
      .reply(200, addressFixture);

    const result = await appTester(App.creates.enrich_address.operation.perform, {
      authData: { apiKey: 'test-key' },
      inputData: { postcode: '6101DB', huisnummer: 19 },
    });

    result.should.eql(flattenEnrichment(addressFixture));
    result.address_straat.should.eql('Markt');
    result.energyLabel_labelClass.should.eql('A');
  });

  it('maps 402 on enrich', async () => {
    nock('https://api.pandlens.nl').get('/v1/address/6101DB/19').reply(402, 'Payment Required');
    try {
      await appTester(App.creates.enrich_address.operation.perform, {
        authData: { apiKey: 'test-key' },
        inputData: { postcode: '6101DB', huisnummer: 19 },
      });
      throw new Error('expected failure');
    } catch (err) {
      err.message.should.match(/monthly lookup limit/i);
    }
  });
});
