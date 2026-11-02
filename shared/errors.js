'use strict';

function parseJsonBody(bodyText) {
  if (typeof bodyText !== 'string' || !bodyText.trim()) {
    return null;
  }
  try {
    const value = JSON.parse(bodyText);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

function errorCodeFromBody(bodyText, jsonBody) {
  const json = jsonBody ?? parseJsonBody(bodyText);
  if (!json) {
    return null;
  }
  if (typeof json.error === 'string') {
    return json.error;
  }
  if (typeof json.code === 'string') {
    return json.code;
  }
  return null;
}

function formatAmbiguousCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return '';
  }
  return candidates
    .map((candidate) => {
      if (!candidate || typeof candidate !== 'object') {
        return String(candidate);
      }
      const parts = [];
      if (candidate.postcode) {
        parts.push(String(candidate.postcode));
      }
      if (candidate.huisnummer !== undefined && candidate.huisnummer !== null) {
        parts.push(String(candidate.huisnummer));
      }
      if (candidate.huisletter) {
        parts.push(String(candidate.huisletter));
      }
      if (candidate.toevoeging) {
        parts.push(String(candidate.toevoeging));
      }
      if (candidate.straat) {
        parts.push(String(candidate.straat));
      }
      if (parts.length === 0) {
        return JSON.stringify(candidate);
      }
      return parts.join(' ');
    })
    .join('; ');
}

function normalizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return {};
  }
  const out = {};
  for (const [key, value] of Object.entries(headers)) {
    out[String(key).toLowerCase()] = value;
  }
  return out;
}

function rateLimitHint(headers) {
  const normalized = normalizeHeaders(headers);
  const reset = normalized['x-ratelimit-reset'];
  if (reset === undefined || reset === null || reset === '') {
    return '';
  }
  const resetSeconds = Number(reset);
  if (!Number.isFinite(resetSeconds)) {
    return '';
  }
  const waitMs = Math.max(0, resetSeconds * 1000 - Date.now());
  if (waitMs <= 0) {
    return ' You can retry now.';
  }
  const waitSeconds = Math.ceil(waitMs / 1000);
  if (waitSeconds < 120) {
    return ` Try again in about ${waitSeconds} second${waitSeconds === 1 ? '' : 's'}.`;
  }
  const waitMinutes = Math.ceil(waitSeconds / 60);
  return ` Try again in about ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`;
}

function throwOrReturnError(zOrErrorFactory, message, name, status) {
  if (zOrErrorFactory?.errors?.Error) {
    throw new zOrErrorFactory.errors.Error(message, name, status);
  }
  throw new Error(message);
}

function mapPandlensHttpError(status, bodyText, zOrErrorFactory, headers) {
  const json = parseJsonBody(bodyText);
  const code = errorCodeFromBody(bodyText, json);

  if (code === 'address_not_found') {
    const detail =
      typeof json?.message === 'string' && json.message.trim()
        ? ` ${json.message.trim()}`
        : '';
    throwOrReturnError(
      zOrErrorFactory,
      `No property was found for this postcode and house number.${detail} Check the postcode, house number, letter, and suffix.`,
      'HttpError',
      status,
    );
  }

  if (code === 'address_ambiguous') {
    const listed = formatAmbiguousCandidates(json?.candidates);
    const suffix = listed
      ? ` Possible matches: ${listed}.`
      : ' Add a house letter or suffix (toevoeging) to select one address.';
    throwOrReturnError(
      zOrErrorFactory,
      `This postcode and house number match more than one address.${suffix}`,
      'HttpError',
      status,
    );
  }

  if (status === 401) {
    throwOrReturnError(
      zOrErrorFactory,
      'Your Pandlens API key is invalid or missing. Create or copy a key from the Pandlens portal.',
      'AuthenticationError',
      status,
    );
  }

  if (status === 402) {
    throwOrReturnError(
      zOrErrorFactory,
      'Your Pandlens monthly lookup limit is reached. Upgrade your plan or wait until the next billing month.',
      'ExpiredAuth',
      status,
    );
  }

  if (status === 429) {
    throwOrReturnError(
      zOrErrorFactory,
      `Pandlens rate limit exceeded.${rateLimitHint(headers)} Reduce parallel runs if this keeps happening.`,
      'Throttled',
      status,
    );
  }

  const detail = typeof bodyText === 'string' && bodyText.trim() ? bodyText.trim() : '';
  const fallback = detail || `Pandlens API request failed (${status}).`;
  throwOrReturnError(zOrErrorFactory, fallback, 'HttpError', status);
}

function assertOkStatus(status, bodyText, zOrErrorFactory, headers) {
  if (status >= 200 && status < 300) {
    return;
  }
  mapPandlensHttpError(status, bodyText, zOrErrorFactory, headers);
}

module.exports = {
  assertOkStatus,
  mapPandlensHttpError,
  parseJsonBody,
  errorCodeFromBody,
  formatAmbiguousCandidates,
  rateLimitHint,
};
