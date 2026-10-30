'use strict';

const { API_BASE_URL } = require('../shared/constants');
const { assertOkStatus } = require('../shared/errors');

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'password',
      helpText:
        'Your Pandlens API key (X-Api-Key). Get a free key at https://pandlens.nl/en/signup — the key is shown once after signup.',
    },
  ],
  test: async (z, _bundle) => {
    const response = await z.request({
      url: `${API_BASE_URL}/v1/usage`,
    });
    assertOkStatus(response.status, response.content, z);
    const usage = response.json;
    const quota =
      usage.monthlyQuota === null || usage.monthlyQuota === undefined
        ? 'unlimited'
        : String(usage.monthlyQuota);
    return {
      plan: usage.plan,
      usedThisMonth: usage.usedThisMonth,
      monthlyQuota: quota,
    };
  },
  connectionLabel: '{{plan}} plan ({{usedThisMonth}}/{{monthlyQuota}} this month)',
};
