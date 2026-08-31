import AppError
  from '../errors/app-error.js';

export function requireRole(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    const roles = req.auth?.roles || [];
    const allowed = roles.some(role => allowedRoles.includes(role));

    if (!allowed) {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }

    next();
  };
}