import app
  from './app.js';

import env
  from './config/env.js';

import mailService
  from './services/mail/mail.service.js';


let server;


/*
 * ======================================================
 * BOOTSTRAP
 * ======================================================
 */

async function bootstrap() {
  try {

    /*
     * Verify active mail provider.
     *
     * The API should still start if
     * the mail provider is temporarily
     * unavailable.
     */
    try {
      await mailService
        .verifyConnection();

      console.log(
        `Mail service ready using ${env.mail.driver}.`
      );

    } catch (error) {
      console.warn(
        `Mail service verification failed (${env.mail.driver}):`,
        error instanceof Error
          ? error.message
          : error
      );
    }


    /*
     * Start HTTP server.
     */
    server =
      app.listen(
        env.port,
        '0.0.0.0',
        () => {
          console.log(
            `AMS API running on port ${env.port}`
          );

          console.log(
            `Environment: ${env.nodeEnv}`
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


/*
 * ======================================================
 * GRACEFUL SHUTDOWN
 * ======================================================
 */

async function shutdown(
  signal
) {
  console.log(
    `${signal} received. Shutting down...`
  );

  if (!server) {
    process.exit(0);
  }


  server.close(
    error => {
      if (error) {
        console.error(
          'Server shutdown failed:',
          error
        );

        process.exit(1);
      }

      console.log(
        'AMS API stopped successfully.'
      );

      process.exit(0);
    }
  );
}


/*
 * ======================================================
 * PROCESS SIGNALS
 * ======================================================
 */

process.on(
  'SIGTERM',
  () => {
    void shutdown(
      'SIGTERM'
    );
  }
);


process.on(
  'SIGINT',
  () => {
    void shutdown(
      'SIGINT'
    );
  }
);


/*
 * ======================================================
 * UNHANDLED ERRORS
 * ======================================================
 */

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


/*
 * ======================================================
 * START APPLICATION
 * ======================================================
 */

void bootstrap();