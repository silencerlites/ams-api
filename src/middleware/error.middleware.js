import AppError from '../errors/app-error.js';


export function notFound(req, res, next) {
  return next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404, 'ROUTE_NOT_FOUND'));
}


export function errorHandler(error, req, res, next) {
  console.error(error);

  /*
   * Firestore document already exists.
   *
   * Usually triggered by:
   * transaction.create(...)
   * ref.create(...)
   */
  if (error.code === 6 || error.code === 'already-exists') {
    return res.status(409).json({
      success: false,
      message: 'A record with the supplied unique value already exists.',
      code: 'DUPLICATE_RECORD'
    });
  }


  /*
   * Firestore document not found.
   */
  if (error.code === 5 || error.code === 'not-found') {
    return res.status(404).json({
      success: false,
      message: 'Requested resource was not found.',
      code: 'RESOURCE_NOT_FOUND'
    });
  }


  /*
   * Firestore permission error.
   */
  if (error.code === 7 || error.code === 'permission-denied') {
    return res.status(403).json({
      success: false,
      message: 'Permission denied.',
      code: 'PERMISSION_DENIED'
    });
  }

  /*
   * Firebase Authentication errors.
   */
  if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
    return handleFirebaseAuthError(error, res);
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : error.message,
    code: error.code || 'INTERNAL_ERROR',
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
}


function handleFirebaseAuthError(error, res) {
  const errors = {
    'auth/user-not-found': {
      status: 404,
      code: 'ACCOUNT_NOT_FOUND',
      message: 'Account not found.'
    },

    'auth/email-already-exists': {
      status: 409,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'An account with this email already exists.'
    },

    'auth/invalid-email': {
      status: 422,
      code: 'INVALID_EMAIL',
      message: 'Invalid email address.'
    },

    'auth/id-token-expired': {
      status: 401,
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Authentication token has expired.'
    },

    'auth/id-token-revoked': {
      status: 401,
      code: 'SESSION_REVOKED',
      message: 'Your session has ended. Please login again.'
    },

    'auth/invalid-id-token': {
      status: 401,
      code: 'INVALID_AUTH_TOKEN',
      message: 'Invalid authentication token.'
    },

    'auth/user-disabled': {
      status: 403,
      code: 'ACCOUNT_DISABLED',
      message: 'This account has been disabled.'
    }
  };


  const mapped = errors[error.code];

  if (!mapped) {
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.',
      code: 'FIREBASE_AUTH_ERROR'
    });
  }

  return res.status(mapped.status).json({
    success: false,
    message: mapped.message,
    code: mapped.code
  });
}