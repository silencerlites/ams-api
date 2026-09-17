import adminRepository from '../repositories/admin.repository.js';
import accountStatusService from '../services/account-status.service.js';
import asyncHandler from '../utils/async-handler.js';
import AppError from '../errors/app-error.js';
import { MODEL_TYPES } from '../constants/model-types.js';
import { AccountStatus } from '../enums/account-status.enum.js';

const ensureActive = asyncHandler(async (req, res, next) => {
  const admin = await adminRepository.findByUid(req.auth.uid);

  if (!admin || admin.deleted_at) {
    throw new AppError('Account not found.', 401, 'ACCOUNT_NOT_FOUND');
  }

  const status = await accountStatusService.getStatus(MODEL_TYPES.ADMIN, admin.id);

  if (!status || status.status !== AccountStatus.ACTIVE || admin.is_active !== true) {
    throw new AppError('Account is not active.', 403,'ACCOUNT_INACTIVE');
  }

  req.account = admin;
  next();
});

export default ensureActive;