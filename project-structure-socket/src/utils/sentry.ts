import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

Sentry.init({
    environment: process.env.SERVER_ENVIRONMENT,
    dsn: process.env.SENTRY_DSN,
    integrations: [
        Sentry.consoleIntegration({
            levels: ['info', 'debug', 'warn', 'error'],
        }),
    ],
    profilesSampleRate: 1.0,
    sendDefaultPii: (process.env.SENTRY_SEND_DEFAULT_PII ?? 'false') === 'true',
    enableLogs: true,
});

export default Sentry;
