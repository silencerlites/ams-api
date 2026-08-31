import Admin from '../models/admin.model.js';
import AppError from '../errors/app-error.js';
import { MODEL_TYPES } from '../constants/model-types.js';

/**
 * Ensure Active Middleware
 *
 * Requires authenticate.middleware.js to run first.
 *
 * Checks whether the authenticated account:
 * - exists
 * - is not soft deleted
 * - is active
 *
 * If inactive, access is denied even if
 * the JWT access token is still valid.
 */
export default async function ensureActive(req, res, next) {
  try {
    if (!req.auth) {
      throw new AppError('Authentication context is missing.', 401, 'AUTHENTICATION_REQUIRED');
    }

    const { sub: modelId, model_type: modelType } = req.auth;

    if (!modelId) {
      throw new AppError('Account ID is missing from access token.', 401, 'INVALID_ACCESS_TOKEN');
    }

    if (!modelType) {
      throw new AppError('Account model type is missing from access token.', 401, 'INVALID_ACCESS_TOKEN');
    }

    let account = null;

    /**
     * Polymorphic account support.
     *
     * Later you can add:
     *
     * case MODEL_TYPES.CLIENT:
     *   account = await Client.findOne(...)
     *   break;
     *
     * case MODEL_TYPES.EMP:
     *   account = await Emp.findOne(...)
     *   break;
     */
    switch (modelType) {
      case MODEL_TYPES.ADMIN:
        account = await Admin.findOne({ id: modelId, deleted_at: null }).lean();
        break;

      default:
        throw new AppError(`Unsupported account type: ${modelType}`, 403, 'ACCOUNT_TYPE_NOT_SUPPORTED');
    }

    if (!account) {
      throw new AppError('Account not found.', 401, 'ACCOUNT_NOT_FOUND');
    }

    /**
     * is_active is synchronized from:
     *
     * 0 Pending      => false
     * 1 Active       => true
     * 2 Deactivated  => false
     * 3 Locked       => false
     * 4 Deleted      => false
     */
    if (account.is_active !== true) {
      throw new AppError('Your account is currently inactive.', 403, 'ACCOUNT_INACTIVE');
    }

    /**
     * Make the account available
     * to the next middleware/controller.
     *
     * Example:
     *
     * req.account.id
     * req.account.email
     * req.account.is_active
     */
    req.account = account;
    return next();

  } catch (error) {
    return next(error);
  }
}