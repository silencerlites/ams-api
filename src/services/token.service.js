import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import env from '../config/env.js';

class TokenService {

  createAccessToken({ subject, modelType, roles = [], tokenVersion = 0 }) {
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        type: 'access',
        model_type: modelType,
        roles,
        token_version: tokenVersion
      },
      env.jwt.accessSecret,
      {
        subject,
        jwtid: jti,
        expiresIn: env.jwt.accessExpiresIn,
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-client'
      });
    return { token, jti };
  }

  createRefreshToken({ subject, modelType }) {
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        type: 'refresh',
        model_type: modelType
      },
      env.jwt.refreshSecret,
      {
        subject,
        jwtid: jti,
        expiresIn: env.jwt.refreshExpiresIn,
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-client'
      });
    return { token, jti };
  }

  createPasswordResetToken({ subject, modelType, tokenVersion }) {
    return jwt.sign(
      {
        type: 'password_reset',
        model_type: modelType,
        token_version: tokenVersion
      },
      env.passwordReset.secret,
      {
        subject,
        jwtid: crypto.randomUUID(),
        expiresIn: env.passwordReset.expiresIn,
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-password-reset'
      }
    );
  }

  verifyPasswordResetToken(token) {
    return jwt.verify(token, env.passwordReset.secret,
      {
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-password-reset'
      }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(
      token,
      env.jwt.accessSecret,
      {
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-client'
      });
  }

  verifyRefreshToken(token) {
    return jwt.verify(
      token,
      env.jwt.refreshSecret,
      {
        issuer: 'srjj-ams-api',
        audience: 'srjj-ams-client'
      }
    );
  }

  decodeExpiration(token) {
    const payload = jwt.decode(token);
    if (!payload?.exp) { throw new Error('Token expiration is missing.'); }
    return new Date(payload.exp * 1000);
  }
}

export default new TokenService();