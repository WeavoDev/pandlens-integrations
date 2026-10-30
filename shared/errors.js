'use strict';

function mapPandlensHttpError(status, bodyText, zOrErrorFactory) {
  const detail = typeof bodyText === 'string' && bodyText.trim() ? bodyText.trim() : '';
  if (status === 401) {
    const message =
      'Your Pandlens API key is invalid or missing. Create or copy a key from the Pandlens portal.';
    if (zOrErrorFactory?.errors?.Error) {
      throw new zOrErrorFactory.errors.Error(message, 'AuthenticationError', status);
    }
    return new Error(message);
  }
  if (status === 402) {
    const message =
      'Your Pandlens monthly lookup limit is reached. Upgrade your plan or wait until the next billing month.';
    if (zOrErrorFactory?.errors?.Error) {
      throw new zOrErrorFactory.errors.Error(message, 'ExpiredAuth', status);
    }
    return new Error(message);
  }
  if (status === 429) {
    const message =
      'Pandlens rate limit exceeded. Wait a minute and try again, or reduce how many lookups run in parallel.';
    if (zOrErrorFactory?.errors?.Error) {
      throw new zOrErrorFactory.errors.Error(message, 'Throttled', status);
    }
    return new Error(message);
  }
  const fallback = detail || `Pandlens API request failed (${status}).`;
  if (zOrErrorFactory?.errors?.Error) {
    throw new zOrErrorFactory.errors.Error(fallback, 'HttpError', status);
  }
  return new Error(fallback);
}

function assertOkStatus(status, bodyText, zOrErrorFactory) {
  if (status >= 200 && status < 300) {
    return;
  }
  mapPandlensHttpError(status, bodyText, zOrErrorFactory);
}

module.exports = {
  assertOkStatus,
  mapPandlensHttpError,
};
