import 'dotenv/config';

const required = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_PASSWORD_RESET_SECRET',

  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_WEB_API_KEY',

  'MAIL_FROM_ADDRESS'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const mailDriver = process.env.MAIL_DRIVER || 'resend';

if (mailDriver === 'resend') {
  if (!process.env.RESEND_API_KEY) {
    throw new Error( 'Missing required environment variable: RESEND_API_KEY');
  }
}

if (mailDriver === 'smtp') {
  const smtpRequired = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  for (const key of smtpRequired) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  passwordReset: {
    secret: process.env.JWT_PASSWORD_RESET_SECRET,
    expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || '15m'
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    webApiKey: process.env.FIREBASE_WEB_API_KEY
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS || 5),
  accountLockMinutes: Number(process.env.ACCOUNT_LOCK_TIME_MINUTES || 15),
  emailVerificationExpiresHours: Number(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || 24),

  mail: {
    driver: process.env.MAIL_DRIVER || 'resend',
    fromName: process.env.MAIL_FROM_NAME || 'SRJJ AMS',
    fromAddress: process.env.MAIL_FROM_ADDRESS,

    resend: {
      apiKey: process.env.RESEND_API_KEY
    },

    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  loginOtp: {
    expiresMinutes: Number(process.env.LOGIN_OTP_EXPIRES_MINUTES || 5),
    maxAttempts: Number(process.env.LOGIN_OTP_MAX_ATTEMPTS || 5),
    resendCooldownSeconds: Number(process.env.LOGIN_OTP_RESEND_COOLDOWN_SECONDS || 60),
    maxResends: Number(process.env.LOGIN_OTP_MAX_RESENDS || 3)
  },

  turnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY
  }
  
});

export default env;