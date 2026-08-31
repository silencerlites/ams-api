import tokenService from '../services/token.service.js';
import accessTokenService from '../services/access-token.service.js';
import Admin from '../models/admin.model.js';
import AppError from '../errors/app-error.js';
import { MODEL_TYPES } from '../constants/model-types.js';

export default async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError( 'Authentication required.', 401, 'AUTHENTICATION_REQUIRED' );
    }

    const [scheme, token] = authorization.split(' ');

    if ( scheme !== 'Bearer' || !token ) {
      throw new AppError( 'Invalid authorization header format.', 401, 'INVALID_AUTHORIZATION_HEADER');
    }

    const payload = tokenService.verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new AppError('Invalid token type.', 401, 'INVALID_TOKEN_TYPE');
    }

    if (!payload.sub || !payload.model_type || !payload.jti) {
      throw new AppError('Invalid access token.', 401, 'INVALID_ACCESS_TOKEN');
    }

    /**
     * Current-session logout check.
     */
    const isRevoked = await accessTokenService.isRevoked(payload.jti);

    if (isRevoked) {
      throw new AppError('Your session has ended. Please login again.', 401,'ACCESS_TOKEN_REVOKED');
    }

    /**
     * token_version check.
     *
     * This handles:
     * - password reset
     * - logout all
     * - forced session termination
     */
    if (payload.model_type === MODEL_TYPES.ADMIN) {
      const admin = await Admin.findOne({ id: payload.sub, deleted_at: null }).select('id token_version').lean();

      if (!admin) {
        throw new AppError('Account not found.', 401, 'ACCOUNT_NOT_FOUND');
      }

      if (payload.token_version !== admin.token_version) {
        throw new AppError('Your session is no longer valid. Please login again.', 401, 'SESSION_REVOKED');
      }
    }

    req.auth = payload;
    req.accessToken = token;
    return next();

  } catch (error) {
    if ( error instanceof AppError) { 
      return next(error);
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired.', 401, 'ACCESS_TOKEN_EXPIRED'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token.', 401, 'INVALID_ACCESS_TOKEN'));
    }

    if (error.name === 'NotBeforeError') {
      return next(new AppError('Access token is not yet valid.', 401, 'ACCESS_TOKEN_NOT_ACTIVE'));
    }

    return next(new AppError('Authentication failed.', 401,'AUTHENTICATION_FAILED'));
  }
}