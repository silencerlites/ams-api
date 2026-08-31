import mongoose from 'mongoose';

import Admin from '../models/admin.model.js';
import AdminProfile from '../models/admin-profile.model.js';
import UserHasRole from '../models/user-has-role.model.js';

import idGeneratorService from './id-generator.service.js';
import accountStatusService from './account-status.service.js';
import loginAttemptService from './login-attempt.service.js';
import refreshTokenService from './refresh-token.service.js';
import tokenService from './token.service.js';
import emailVerificationService from './email-verification.service.js';
import loginOtpService from './login-otp.service.js';

import AppError from '../errors/app-error.js';

import { MODEL_TYPES } from '../constants/model-types.js';

import { AccountStatus, AccountStatusName } from '../enums/account-status.enum.js';
import { RoleEnum } from '../enums/role.enum.js';

class AuthService {
    async register(payload) {
        const existing = await Admin.findOne({ email: payload.email });
        if (existing) { throw new AppError('An account with this email already exists.', 409, 'EMAIL_ALREADY_EXISTS'); }
        const session = await mongoose.startSession();
        let admin;

        try {
            await session.withTransaction(async () => {
                const adminId = await idGeneratorService.generateAdminId(session);
                const createdAdmins = await Admin.create([{
                    id: adminId,
                    email: payload.email,
                    password: payload.password,
                    is_active: false
                }], { session });

                admin = createdAdmins[0];

                await AdminProfile.create([{
                    admin_id: admin.id,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    middle_name: payload.middle_name ?? null,
                    ext_name: payload.ext_name ?? null,
                    profile_picture_path: null
                }], { session });

                await accountStatusService.setStatus({
                    modelType: MODEL_TYPES.ADMIN,
                    modelId: admin.id,
                    status: AccountStatus.PENDING,
                    session
                });

                /*
                 * Normal self-registration should
                 * receive Admin role, NOT Super Admin.
                 */
                await UserHasRole.create([{
                    role_id: RoleEnum.ADMIN,
                    model_type: MODEL_TYPES.ADMIN,
                    model_id: admin.id
                }], { session });
            });
        } finally { await session.endSession(); }

        /*
         * Send only AFTER the database transaction
         * succeeds.
         */
        try {
            await emailVerificationService.sendAdminVerification(admin);
        } catch (error) {
            console.error('Verification email failed:', error);

            // Account still exists.
            // User may call resend verification.
        }

        return {
            id: admin.id,
            email: admin.email,
            status: AccountStatusName[AccountStatus.PENDING]
        };
    }

    async login({ email, password, ipAddress, userAgent }) {
        /*
         * Password explicitly selected because
         * Admin.password has select:false.
         */
        const admin = await Admin.findOne({ email, deleted_at: null }).select('+password');

        /*
         * Generic response prevents basic
         * account enumeration.
         */
        if (!admin) { throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'); }

        /*
         * Check temporary lock.
         * This can automatically unlock if
         * 15 minutes already elapsed.
         */
        const lock = await loginAttemptService.isCurrentlyLocked(MODEL_TYPES.ADMIN, admin.id);

        if (lock.locked) {
            throw new AppError('Account temporarily locked due to too many failed login attempts.', 423, 'ACCOUNT_LOCKED', { unlock_at: lock.unlockAt });
        }

        /*
         * Reload because automatic unlock
         * may have changed is_active.
         */
        const freshAdmin = await Admin.findOne({ id: admin.id, deleted_at: null }).select('+password');

        if (!freshAdmin.email_verified_at) {
            throw new AppError('Please verify your email address before signing in.', 403, 'EMAIL_NOT_VERIFIED');
        }

        const statusRecord = await accountStatusService.getStatus(MODEL_TYPES.ADMIN, freshAdmin.id);

        if (!statusRecord) {
            throw new AppError('Account status is unavailable.', 403, 'ACCOUNT_STATUS_MISSING');
        }

        /*
         * Pending needs a specific response.
         */
        if (statusRecord.status === AccountStatus.PENDING) {
            throw new AppError('Your account is awaiting administrator approval.', 403, 'ACCOUNT_PENDING');
        }

        if (statusRecord.status === AccountStatus.DEACTIVATED) {
            throw new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
        }

        if (statusRecord.status === AccountStatus.DELETED) {
            throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }

        if (!freshAdmin.is_active) {
            throw new AppError('This account is currently inactive.', 403, 'ACCOUNT_INACTIVE');
        }

        const validPassword = await freshAdmin.comparePassword(password);
        if (!validPassword) {
            const failure = await loginAttemptService.registerFailure(MODEL_TYPES.ADMIN, freshAdmin.id);

            if (failure.locked) {
                throw new AppError('Too many unsuccessful login attempts. Account temporarily locked.', 423, 'ACCOUNT_LOCKED',
                    { unlock_at: failure.unlockAt });
            }

            throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS', { remaining_attempts: failure.remaining });
        }

        await loginAttemptService.reset(MODEL_TYPES.ADMIN, freshAdmin.id);

        const challenge = await loginOtpService.create({
            modelType: MODEL_TYPES.ADMIN,
            modelId: freshAdmin.id,
            email: freshAdmin.email,
            ipAddress,
            userAgent
        });

        return {
            otp_required: true,
            challenge_id: challenge.challengeId,
            expires_at: challenge.expiresAt
        };
    }

    async verifyLoginOtp({ challengeId, otp, ipAddress, userAgent }) {
        const challenge = await loginOtpService.verify({ challengeId, otp });

        if (challenge.model_type !== MODEL_TYPES.ADMIN) {
            throw new AppError('Unsupported account type.', 403, 'ACCOUNT_TYPE_NOT_SUPPORTED');
        }

        const admin = await Admin.findOne({ id: challenge.model_id, deleted_at: null });

        if (!admin) { throw new AppError('Account not found.', 401, 'ACCOUNT_NOT_FOUND'); }

        /**
         * Always re-check status here.
         *
         * Account could have been disabled
         * between password login and OTP.
         */
        if (!admin.is_active) { throw new AppError('Account is inactive.', 403, 'ACCOUNT_INACTIVE'); }

        const roles = await UserHasRole.find({ model_type: MODEL_TYPES.ADMIN, model_id: admin.id }).lean();

        const roleIds = roles.map(role => role.role_id);

        const { token: accessToken } = tokenService.createAccessToken({
            subject: admin.id,
            modelType: MODEL_TYPES.ADMIN,
            roles: roleIds,
            tokenVersion: admin.token_version
        });

        const refreshToken = await refreshTokenService.issue({
            modelType: MODEL_TYPES.ADMIN,
            modelId: admin.id,
            ipAddress,
            userAgent
        });

        return {
            token_type: 'Bearer',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
            account: {
                id: admin.id,
                email: admin.email,
                is_active: admin.is_active,
                roles: roleIds
            }
        };
    }

    async refresh({ refreshToken, ipAddress, userAgent }) {
        let rotated;
        try {
            rotated = await refreshTokenService.rotate({
                token: refreshToken,
                ipAddress,
                userAgent
            });
        } catch {
            throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
        }

        if (rotated.modelType !== MODEL_TYPES.ADMIN) {
            throw new AppError('Invalid account type.', 401, 'INVALID_ACCOUNT_TYPE');
        }

        const admin = await Admin.findOne({
            id: rotated.modelId,
            deleted_at: null
        });

        if (!admin || !admin.is_active) {
            await refreshTokenService.revokeAll(rotated.modelType, rotated.modelId);
            throw new AppError('Account is inactive.', 403, 'ACCOUNT_INACTIVE');
        }

        const roles = await UserHasRole.find({
            model_type: MODEL_TYPES.ADMIN,
            model_id: admin.id
        }).lean();

        const roleIds = roles.map(role => role.role_id);

        const accessToken = tokenService.createAccessToken({
            subject: admin.id,
            modelType: MODEL_TYPES.ADMIN,
            roles: roleIds,
            tokenVersion: admin.token_version
        });

        return {
            token_type: 'Bearer',
            access_token: accessToken,
            refresh_token: rotated.refreshToken,
            expires_in: 900
        };
    }

    async logout(refreshToken) {
        await refreshTokenService.revoke(refreshToken);
    }

    async logoutAll(adminId) {
        await refreshTokenService.revokeAll(MODEL_TYPES.ADMIN, adminId);
    }

    async changePassword({ adminId, currentPassword, newPassword}) {
        /**
         * Password is select:false,
         * so explicitly select it.
         */
        const admin = await Admin.findOne({ id: adminId, deleted_at: null }).select('+password');

        if (!admin) {
            throw new AppError('Account not found.', 404, 'ACCOUNT_NOT_FOUND');
        }

        /**
         * Check current password.
         */
        const validCurrentPassword = await admin.comparePassword(currentPassword);

        if (!validCurrentPassword) {
            throw new AppError('Current password is incorrect.', 422, 'CURRENT_PASSWORD_INCORRECT');
        }

        /**
         * Prevent same password.
         */
        const samePassword = await admin.comparePassword(newPassword);

        if (samePassword) {
            throw new AppError('New password must be different from your current password.', 422, 'PASSWORD_REUSE_NOT_ALLOWED');
        }

        /**
         * Change password.
         *
         * Admin model pre-save middleware
         * should hash this automatically.
         */
        admin.password = newPassword;

        /**
         * Invalidate all old
         * access tokens.
         */
        admin.token_version += 1;
        await admin.save();

        /**
         * Invalidate all refresh tokens.
         */
        await refreshTokenService.revokeAll(MODEL_TYPES.ADMIN, admin.id);

        return { changed: true };
    }
}

export default new AuthService();