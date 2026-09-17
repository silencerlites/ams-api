import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email().transform(value => value.trim().toLowerCase()),
  password: z.string().min(12).max(128).regex(/[a-z]/, { message: 'Password requires a lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password requires an uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password requires a number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password requires a special character.' }),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  middle_name: z.string().trim().max(100).nullable().optional(),
  ext_name: z.string().trim().max(20).nullable().optional()
});

export const loginSchema = z.object({
  email: z.email().transform(value => value.trim().toLowerCase()),
  password: z.string().min(1),
  turnstile_token: z.string().min(1, 'Security verification is required.').max(2048)
});

export const refreshSchema = z.object({
  refresh_token: z.string({ required_error: 'Refresh token is required.', invalid_type_error: 'Refresh token must be a string.'}).min(1, 'Refresh token is required.').max(4096, 'Invalid refresh token.')
});

export const logoutSchema = z.object({
  refresh_token: z.string().min(1)
});

export const verifyEmailSchema =
  z.object({
    oob_code:
      z.string()
        .min(
          1,
          'Verification code is required.'
        )
  });

export const verifyLoginOtpSchema = z.object({
  challenge_id: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must contain exactly 6 digits.')
});

export const resendLoginOtpSchema = z.object({
  challenge_id: z.string().uuid()
});

export const forgotPasswordSchema = z.object({
  email: z.email().transform(value => value.trim().toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Password reset token is required.'),
  password: z.string().min(12, 'Password must contain at least 12 characters.')
    .max(128, 'Password cannot exceed 128 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
  password_confirmation: z.string()
}).refine(
  data => data.password === data.password_confirmation,
  {
    message: 'Password confirmation does not match.',
    path: ['password_confirmation']
  });

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required.'),
  password: z.string().min(8, 'New password must be at least 8 characters.').max(128, 'New password cannot exceed 128 characters.'),
  password_confirmation: z.string().min(1, 'Password confirmation is required.')
})
  .refine(data => data.password === data.password_confirmation,
    {
      message: 'Password confirmation does not match.',
      path: ['password_confirmation']
    });

