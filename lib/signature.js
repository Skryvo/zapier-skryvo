const crypto = require('crypto');

const TOLERANCE_SECONDS = 300;

/** True when the header holds a fresh v1 HMAC-SHA256 of "<t>.<raw body>" under the endpoint's secret. */
const signed = (raw, header, secret, now = Math.floor(Date.now() / 1000)) => {
  if (!header || !secret || typeof raw !== 'string') return false;
  let t = NaN;
  const given = [];
  for (const part of header.split(',')) {
    const [key, value = ''] = part.trim().split('=', 2);
    if (key === 't') t = Number(value);
    if (key === 'v1' && value) given.push(value);
  }
  if (!Number.isFinite(t) || Math.abs(now - t) > TOLERANCE_SECONDS) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest();
  return given.some((hex) => {
    const candidate = Buffer.from(hex, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  });
};

module.exports = { signed };
