import Admin from '../models/admin.model.js';
import AdminProfile from '../models/admin-profile.model.js';
import accountStatusService from '../services/account-status.service.js';
import mailService from '../services/mail/mail.service.js';
import { accountApprovedTemplate } from '../templates/account-approved.template.js';
import { MODEL_TYPES } from '../constants/model-types.js';
import env from '../config/env.js';
import AppError from '../errors/app-error.js';
import asyncHandler from '../utils/async-handler.js';
import { success } from '../utils/response.js';

export const approveAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findOne({ id, deleted_at: null });

  if (!admin) {
    throw new AppError( 'Admin not found.', 404, 'ADMIN_NOT_FOUND' );
  }

  if (!admin.email_verified_at) {
    throw new AppError('Administrator must verify their email before approval.', 409, 'EMAIL_NOT_VERIFIED');
  }

  await accountStatusService.activate(MODEL_TYPES.ADMIN, admin.id);

  const profile = await AdminProfile.findOne({ admin_id: admin.id }).lean();
  const template = accountApprovedTemplate({ firstName: profile?.first_name || 'User', loginUrl: `${env.clientUrl}/login`});

  try {
    await mailService.send({ to: admin.email, ...template });
  } catch (error) {
    console.error( 'Approval email failed:', error );
  }

  return success(res, { message: 'Administrator approved successfully.' });
}
);