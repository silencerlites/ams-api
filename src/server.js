import app
  from './app.js';

import env
  from './config/env.js';

import mailService
  from './services/mail.service.js';


let server;


async function bootstrap() {
  try {
    try {
      await mailService
        .verifyConnection();

      console.log(
        'Mail service ready.'
      );

    } catch (error) {
      console.warn(
        'Mail service verification failed:',
        error.message
      );
    }


    server =
      app.listen(
        env.port,
        '0.0.0.0',
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


async function shutdown(
  signal
) {
  console.log(
    `${signal} received. Shutting down...`
  );

  if (server) {
    server.close(
      () => {
        process.exit(0);
      }
    );

    return;
  }

  process.exit(0);
}


process.on(
  'SIGTERM',
  () =>
    shutdown(
      'SIGTERM'
    )
);


process.on(
  'SIGINT',
  () =>
    shutdown(
      'SIGINT'
    )
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