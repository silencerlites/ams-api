import RevokedAccessToken from '../models/revoked-access-token.model.js';

class AccessTokenService {

  async revoke(payload) {
    if ( !payload?.jti || !payload?.sub || !payload?.exp) { return; }
    await RevokedAccessToken.findOneAndUpdate(
      { jti: payload.jti },
      { $setOnInsert: {
          jti: payload.jti,
          model_type: payload.model_type,
          model_id: payload.sub,
          expires_at: new Date( payload.exp * 1000 ),
          revoked_at: new Date() }},
      { upsert: true, returnDocument: 'after' }
    );
  }

  async isRevoked(jti) {
    if (!jti) { return true; }
    const revoked = await RevokedAccessToken.exists({ jti });
    return Boolean(revoked);
  }
}

export default new AccessTokenService();