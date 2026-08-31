import crypto from 'node:crypto';

export function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

export function randomUuid() {
  return crypto.randomUUID();
}

export function randomToken(size = 48) {
  return crypto
    .randomBytes(size)
    .toString('hex');
}

export function generateOtp() {
  return crypto.randomInt(
    100000,
    1000000
  ).toString();
}