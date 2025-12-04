import * as Sentry from '@sentry/nestjs';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        Sentry.consoleIntegration({
            levels: ['info', 'debug', 'warn', 'error'],
        }),
    ],

    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    sendDefaultPii: (process.env.SENTRY_SEND_DEFAULT_PII ?? 'false') === 'true',
    enableLogs: true,

    beforeSendTransaction(transaction) {
        transaction.spans =
            transaction.spans?.filter((span) =>
                ['http.server'].includes(span.op ?? '')
            ) ?? [];
        return transaction;
    },
});

const levelMap = {
    trace: 'debug',
    debug: 'debug',
    info: 'info',
    warn: 'warning',
    error: 'error',
    fatal: 'fatal',
} as const;

type SdkLevel = (typeof levelMap)[keyof typeof levelMap];
type LogLevelKeys = keyof typeof levelMap;
type Ctx = Record<string, unknown> | undefined;

function sendEvent(level: SdkLevel, message: string, context?: Ctx) {
    Sentry.captureEvent({
        level,
        message,
        logger: 'app',
        extra: context,
    });
}

function defineLoggerIfMissing() {
    type SentryWithLogger = {
        logger?: Record<LogLevelKeys, (message: string, context?: Ctx) => void>;
    };
    const sentryRef = Sentry as unknown as SentryWithLogger;
    if (sentryRef.logger && typeof sentryRef.logger === 'object') return;

    const logger: Record<
        LogLevelKeys,
        (message: string, context?: Ctx) => void
    > = {
        trace: (message, context) =>
            sendEvent(levelMap.trace, message, context),
        debug: (message, context) =>
            sendEvent(levelMap.debug, message, context),
        info: (message, context) => sendEvent(levelMap.info, message, context),
        warn: (message, context) => sendEvent(levelMap.warn, message, context),
        error: (message, context) => {
            const err =
                context && 'error' in context
                    ? (context as { error?: unknown }).error
                    : undefined;
            if (err instanceof Error) {
                Sentry.captureException(err);
            } else {
                sendEvent(levelMap.error, message, context);
            }
        },
        fatal: (message, context) => {
            const err =
                context && 'error' in context
                    ? (context as { error?: unknown }).error
                    : undefined;
            if (err instanceof Error) {
                Sentry.captureException(err);
            } else {
                sendEvent(levelMap.fatal, message, context);
            }
        },
    };

    sentryRef.logger = logger;
}

defineLoggerIfMissing();

export default Sentry;
