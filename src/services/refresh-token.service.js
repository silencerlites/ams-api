import RefreshToken from '../models/refresh-token.model.js';
import tokenService from './token.service.js';
import { sha256 } from '../utils/crypto.js';
import AppError from '../errors/app-error.js';

class RefreshTokenService {
  /**
   * Create a refresh token
   * during successful login.
   */
  async issue({ modelType, modelId, ipAddress = null, userAgent = null }) {
    const { token, jti } = tokenService.createRefreshToken({ subject: modelId, modelType });
    const tokenHash = sha256(token);
    const expiresAt = tokenService.decodeExpiration( token );

    await RefreshToken.create({
      tokenable_type: modelType,
      tokenable_id: modelId,
      token_hash: tokenHash,
      jti,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    /**
     * Raw token is returned only to
     * the client.
     */
    return token;
  }

  /**
   * Refresh Token Rotation
   *
   * old token:
   * A
   *
   * becomes:
   *
   * A revoked
   *       ↓
   * B created
   */
  async rotate({ token, ipAddress = null, userAgent = null }) {
    let payload;

    try { 
      payload = tokenService.verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }

    if ( payload.type !== 'refresh') {
      throw new AppError('Invalid token type.', 401, 'INVALID_TOKEN_TYPE');
    }

    const tokenHash = sha256(token);
    const storedToken = await RefreshToken.findOne({
        token_hash: tokenHash,
        jti: payload.jti
      });

    if (!storedToken) {
      throw new AppError('Refresh token is invalid.', 401, 'INVALID_REFRESH_TOKEN');
    }

    /**
     * Expired database record check.
     *
     * Normally Mongo TTL removes this later,
     * but don't rely only on TTL timing.
     */
    if (storedToken.expires_at <= new Date()) {
      throw new AppError( 'Refresh token has expired.', 401, 'REFRESH_TOKEN_EXPIRED' );
    }

    /**
     * Very important:
     *
     * If an already-revoked refresh token
     * gets reused, someone may have stolen
     * a previous token.
     *
     * Revoke every session for that account.
     */
    if (storedToken.revoked_at) {
      await this.revokeAll({
        modelType: storedToken.tokenable_type,
        modelId: storedToken.tokenable_id
      });

      throw new AppError( 'Refresh token reuse detected. All sessions have been revoked.', 401, 'REFRESH_TOKEN_REUSE_DETECTED');
    }

    /**
     * Create replacement token.
     */
    const { token: newToken, jti: newJti} = tokenService.createRefreshToken({
        subject: storedToken.tokenable_id,
        modelType: storedToken.tokenable_type
      });

    const newTokenHash = sha256(newToken);
    const expiresAt = tokenService.decodeExpiration( newToken );

    /**
     * Revoke old token.
     */
    storedToken.revoked_at = new Date();
    storedToken.replaced_by_jti = newJti;
    await storedToken.save();

    /**
     * Store replacement token.
     */
    await RefreshToken.create({
      tokenable_type: storedToken.tokenable_type,
      tokenable_id: storedToken.tokenable_id,
      token_hash: newTokenHash,
      jti: newJti,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return {
      modelType: storedToken.tokenable_type,
      modelId: storedToken.tokenable_id,
      refreshToken: newToken
    };
  }

  /**
   * Logout one session.
   *
   * Only the supplied refresh token
   * becomes invalid.
   */
  async revoke(token) {

  if (!token) { return false; }

  const tokenHash = sha256(token);

  const result = await RefreshToken.findOneAndUpdate(
      { token_hash: tokenHash,
        revoked_at: null },
      { $set: { revoked_at: new Date()} },
      { returnDocument: 'after', });
  return Boolean(result);
}

  /**
   * Logout all devices.
   */
async revokeAll({ modelType, modelId }) {
  return RefreshToken.updateMany(
    { tokenable_type: modelType,
      tokenable_id: modelId,
      revoked_at: null },
    { $set: { revoked_at: new Date() }} );
}

  /**
   * Return active sessions.
   *
   * Useful later for:
   *
   * Settings →
   * Security →
   * Logged-in devices
   */
  async getActiveSessions({ modelType, modelId }) {
    return RefreshToken.find({
      tokenable_type: modelType,
      tokenable_id: modelId,
      revoked_at: null,
      expires_at: { $gt: new Date() }
    })
      .select( 'jti ip_address user_agent created_at expires_at' )
      .sort({ created_at: -1 })
      .lean();
  }

  /**
   * Revoke a particular session/device.
   */
  async revokeSession({ modelType, modelId, jti }) {
    return RefreshToken.findOneAndUpdate(
      { tokenable_type: modelType,
        tokenable_id: modelId,
        jti: jti,
        revoked_at: null },
      { $set: { revoked_at: new Date() } },
      { returnDocument: 'after', }
    );
  }
}

export default new RefreshTokenService();