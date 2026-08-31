import app
  from './app.js';

import env
  from './config/env.js';

import {
  connectDatabase,
  disconnectDatabase
} from './config/database.js';

import mailService
  from './services/mail.service.js';

let server;

async function bootstrap() {
  try {
    await connectDatabase();

    try {
      await mailService
        .verifyConnection();

      console.log(
        'SMTP connection verified.'
      );
    } catch (error) {
      console.warn(
        'SMTP verification failed:',
        error.message
      );
    }

    server = app.listen(
      env.port,
      () => {
        console.log(
          `AMS API running on port ${env.port}`
        );
      }
    );
  } catch (error) {
    console.error(
      'Application startup failed:',
      error
    );

    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down...`
  );

  if (server) {
    server.close(
      async () => {
        await disconnectDatabase();

        process.exit(0);
      }
    );
  } else {
    await disconnectDatabase();

    process.exit(0);
  }
}

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
);

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
);

process.on(
  'unhandledRejection',
  error => {
    console.error(
      'Unhandled rejection:',
      error
    );
  }
);

process.on(
  'uncaughtException',
  error => {
    console.error(
      'Uncaught exception:',
      error
    );

    process.exit(1);
  }
);

bootstrap();