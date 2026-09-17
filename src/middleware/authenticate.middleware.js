import firebaseAuthService from '../services/firebase-auth.service.js';
import asyncHandler from '../utils/async-handler.js';
import AppError from '../errors/app-error.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AppError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');
  }

  const token = authorization.slice(7).trim();
  const decoded = await firebaseAuthService.verifyIdToken(token, true);

  req.auth = {
    uid: decoded.uid,
    model_type: decoded.model_type,
    admin_id: decoded.admin_id,
    roles: decoded.roles ?? [],
    ams_mfa_verified: decoded.ams_mfa_verified === true
  };

  next();
});

export default authenticate;