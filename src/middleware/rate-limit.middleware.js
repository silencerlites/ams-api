import {
  rateLimit
} from 'express-rate-limit';


const baseOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false
};


export const authRateLimiter =
  rateLimit({
    ...baseOptions,

    windowMs:
      15 * 60 * 1000,

    limit:
      100,

    message: {
      success: false,
      message:
        'Too many requests. Please try again later.',
      code:
        'TOO_MANY_REQUESTS'
    }
  });


export const loginRateLimiter =
  rateLimit({
    ...baseOptions,

    windowMs:
      15 * 60 * 1000,

    limit:
      20,

    skipSuccessfulRequests:
      true,

    message: {
      success: false,
      message:
        'Too many authentication attempts. Please try again later.',
      code:
        'LOGIN_RATE_LIMITED'
    }
  });