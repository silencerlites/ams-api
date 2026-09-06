import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import env from './config/env.js';
import swaggerSpec from './config/swagger.js';

import routes from './routes/index.js';

import {
  authRateLimiter
} from './middleware/rate-limit.middleware.js';

import {
  notFound,
  errorHandler
} from './middleware/error.middleware.js';


const app = express();


app.disable(
  'x-powered-by'
);


app.set(
  'trust proxy',
  1
);


app.use(
  helmet()
);


app.use(
  cors({
    origin:
      env.clientUrl,

    credentials:
      true
  })
);


app.use(
  compression()
);


app.use(
  express.json({
    limit:
      '1mb'
  })
);


app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      '1mb'
  })
);


/**
 * Health Check
 */
app.get(
  '/api/v1/health',

  (req, res) => {
    res.status(200).json({
      success:
        true,

      message:
        'AMS API is operational.',

      environment:
        env.nodeEnv,

      timestamp:
        new Date().toISOString()
    });
  }
);


/**
 * Swagger JSON
 */
app.get(
  '/api/v1/docs.json',

  (req, res) => {
    res.status(200).json(
      swaggerSpec
    );
  }
);


/**
 * Swagger UI
 */
app.use(
  '/api/v1/docs',

  swaggerUi.serve,

  swaggerUi.setup(
    swaggerSpec,
    {
      explorer:
        true,

      customSiteTitle:
        'SRJJ AMS API Documentation'
    }
  )
);


/**
 * API Routes
 */
app.use(
  '/api/v1',
  authRateLimiter,
  routes
);


/**
 * Error Handling
 */
app.use(
  notFound
);


app.use(
  errorHandler
);


export default app;