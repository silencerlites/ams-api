import env from '../config/env.js';
import Admin from '../models/admin.model.js';
import AdminProfile from '../models/admin-profile.model.js';
import EmailVerificationToken from '../models/email-verification-token.model.js';
import mailService from './mail.service.js';

import { randomToken, sha256 } from '../utils/crypto.js';
import { MODEL_TYPES } from '../constants/model-types.js';

import { verificationTemplate } from '../templates/verification.template.js';
import { welcomeTemplate } from '../templates/welcome.template.js';

class EmailVerificationService {

  async sendAdminVerification(admin) {
    await EmailVerificationToken.deleteMany({
      model_type: MODEL_TYPES.ADMIN,
      model_id: admin.id,
      used_at: null
    });

    const rawToken = randomToken(48);
    const expiresAt = new Date( Date.now() + env.emailVerificationExpiresHours * 60 * 60 * 1000);

    await EmailVerificationToken.create({
      model_type: MODEL_TYPES.ADMIN,
      model_id: admin.id,
      token_hash: sha256(rawToken),
      expires_at: expiresAt
    });

    const profile = await AdminProfile.findOne({ admin_id: admin.id }).lean();
    const verificationUrl = `${env.clientUrl}` + `/verify-email?token=` + encodeURIComponent(rawToken);
    const template = verificationTemplate({ firstName: profile?.first_name || 'User', verificationUrl});
    await mailService.send({ to: admin.email, ...template });
  }

  async verify(rawToken) {
    const tokenHash = sha256(rawToken);

    const verification =
      await EmailVerificationToken.findOne({
        token_hash: tokenHash,
        used_at: null,
        expires_at: {
          $gt: new Date()
        }
      });

    if (!verification) {
      throw new Error( 'Verification token is invalid or expired.' );
    }

    if ( verification.model_type !== MODEL_TYPES.ADMIN) {
      throw new Error('Unsupported account type.');
    }

    const admin = await Admin.findOne({ id: verification.model_id, deleted_at: null });

    if (!admin) {
      throw new Error( 'Account does not exist.' );
    }

    if (!admin.email_verified_at) { admin.email_verified_at = new Date();
      await admin.save();
    }

    verification.used_at = new Date();

    await verification.save();

    const profile = await AdminProfile.findOne({ admin_id: admin.id }).lean();
    const template = welcomeTemplate({ firstName: profile?.first_name || 'User' });
    await mailService.send({ to: admin.email, ...template });
    return admin;
  }
}

export default new EmailVerificationService();