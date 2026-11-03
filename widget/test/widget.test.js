import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWidgetUrl } from '../src/api.js';

describe('widget API URL', () => {
  it('normalizes postcode and encodes path', () => {
    const url = buildWidgetUrl('https://api.pandlens.nl', {
      postcode: '6101 db',
      huisnummer: '19',
      toevoeging: 'a',
    });
    assert.equal(url, 'https://api.pandlens.nl/v1/widget/address/6101DB/19?toevoeging=a');
  });
});
