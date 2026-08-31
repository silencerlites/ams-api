import express
  from 'express';

import helmet
  from 'helmet';

import cors
  from 'cors';

import compression
  from 'compression';

import routes
  from './routes/index.js';

import env
  from './config/env.js';

import {
  authRateLimiter
} from './middleware/rate-limit.middleware.js';

import {
  notFound,
  errorHandler
} from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

app.set(
  'trust proxy',
  1
);

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);

app.use(
  compression()
);

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
);

app.get(
  '/api/v1/health',
  (req, res) => {
    res.json({
      success: true,
      message:
        'AMS API is operational.',
      environment:
        env.nodeEnv,
      timestamp:
        new Date().toISOString()
    });
  }
);

app.use(
  '/api/v1',
  authRateLimiter,
  routes
);

app.use(notFound);

app.use(errorHandler);

export default app;