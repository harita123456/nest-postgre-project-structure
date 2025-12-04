import winston from 'winston';
import * as Sentry from '@sentry/nestjs';

export type LogLevel =
    | 'info'
    | 'warn'
    | 'error'
    | 'debug'
    | 'trace'
    | 'verbose'
    | 'fatal';

const colors: Record<LogLevel, (msg: string) => string> = {
    error: (msg) => `\x1b[31m${msg}\x1b[0m`, //
    warn: (msg) => `\x1b[33m${msg}\x1b[0m`, //
    info: (msg) => `\x1b[32m${msg}\x1b[0m`, //
    debug: (msg) => `\x1b[34m${msg}\x1b[0m`, //
    trace: (msg) => `\x1b[90m${msg}\x1b[0m`, //
    verbose: (msg) => `\x1b[35m${msg}\x1b[0m`, //
    fatal: (msg) => `\x1b[41m${msg}\x1b[0m`, //
};

interface LogMeta {
    [key: string]: unknown;
}

const safeStringify = (value: unknown, maxDepth: number = 3): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return JSON.stringify(value);
    if (typeof value === 'symbol') return value.description ?? '<symbol>';
    if (typeof value === 'function')
        return `[Function: ${value.name || 'anonymous'}]`;

    if (value instanceof Error) {
        return `${value.name}: ${value.message}\nStack: ${value.stack}`;
    }
    const excludeProps = new Set([
        'socket',
        'req',
        'res',
        'client',
        'connection',
        'agent',
        'parser',
        '_httpMessage',
        'rawHeaders',
        'rawTrailers',
        '_events',
        '_eventsCount',
        'outputData',
        'autoSelectFamilyAttemptedAddresses',
        'sockets',
        'freeSockets',
        '_sessionCache',
    ]);

    try {
        const seen = new WeakSet<object>();
        const depth = 0;

        return JSON.stringify(
            value,
            (key, val) => {
                if (excludeProps.has(key)) {
                    return '[Excluded]';
                }
                if (val instanceof Error) {
                    return {
                        __error: true,
                        name: val.name,
                        message: val.message,
                        stack: val.stack?.split('\n').slice(0, 5).join('\n'),
                    };
                }

                if (val !== null && typeof val === 'object') {
                    const obj = val as object;
                    if (seen.has(obj)) {
                        return '[Circular]';
                    }
                    seen.add(obj);

                    if (depth >= maxDepth) {
                        return Array.isArray(val) ? '[...]' : '{...}';
                    }
                }
                if (typeof val === 'function') {
                    return `[Function]`;
                }

                if (typeof val === 'symbol') {
                    return '<symbol>';
                }

                const next: unknown = val;
                return next;
            },
            2
        );
    } catch {
        try {
            return Object.prototype.toString.call(value);
        } catch {
            return Object.prototype.toString.call(value);
        }
    }
};

const levelOrder: LogLevel[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
];

const envSentryLevel =
    (process.env.SENTRY_LOG_LEVEL?.toLowerCase() as LogLevel | 'all') ||
    'error';

const shouldSendToSentry = (level: LogLevel): boolean => {
    if (envSentryLevel === 'all') return true;
    const idx = levelOrder.indexOf(level);
    const minIdx = levelOrder.indexOf(envSentryLevel);
    return idx >= 0 && minIdx >= 0 && idx >= minIdx;
};

export const logger = winston.createLogger({
    level: 'silly',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.printf((info) => {
                    const message =
                        typeof info.message === 'string'
                            ? info.message
                            : safeStringify(info.message);
                    const meta = info.meta
                        ? ` ${safeStringify(info.meta)}`
                        : '';
                    return `${message}${meta}`;
                })
            ),
        }),
    ],
});

const sendToSentry = (level: LogLevel, message: string, context?: LogMeta) => {
    if (!shouldSendToSentry(level)) return;
    type SentryWithLogger = {
        logger?: Record<LogLevel, (msg: string, ctx?: LogMeta) => void>;
    };
    const sentryRef = Sentry as unknown as SentryWithLogger;
    const sentryLogger = sentryRef.logger;

    if (sentryLogger && typeof sentryLogger[level] === 'function') {
        sentryLogger[level](message, context);
        return;
    }
    const err =
        context && 'error' in context
            ? (context as { error?: unknown }).error
            : undefined;
    if (err instanceof Error) {
        Sentry.captureException(err);
    }
};

export const appLogger = {
    trace: (message: string, context?: LogMeta) => {
        const msg = safeStringify(message);
        logger.debug(colors.trace(msg));
        sendToSentry('trace', msg, context);
    },
    debug: (message: string, context?: LogMeta) => {
        const msg = safeStringify(message);
        logger.debug(colors.debug(msg));
        sendToSentry('debug', msg, context);
    },
    info: (message: string, context?: LogMeta) => {
        const msg = safeStringify(message);
        logger.info(colors.info(msg));
        sendToSentry('info', msg, context);
    },
    warn: (message: string, context?: LogMeta) => {
        const msg = safeStringify(message);
        logger.warn(colors.warn(msg));
        sendToSentry('warn', msg, context);
    },
    error: (message: string, context?: LogMeta) => {
        const formatted = `${message} ${context ? safeStringify(context) : ''}`;
        logger.error(colors.error(formatted));
        Sentry.logger.error(formatted);

        if (context?.error instanceof Error) {
            Sentry.captureException(context.error);
        } else {
            Sentry.captureMessage(message, 'error');
        }
    },
    fatal: (message: string, context?: LogMeta) => {
        const msg = safeStringify(message);
        logger.error(
            colors.fatal(
                context?.error ? `${msg} ${safeStringify(context)}` : msg
            )
        );
        sendToSentry('fatal', msg, context);
    },
};

export const log = (
    level: LogLevel,
    message: string | object,
    meta?: LogMeta
) => {
    const formattedMessage =
        typeof message === 'string' ? message : safeStringify(message);
    logger.log({ level, message: formattedMessage, meta });
};

export const logError = (message: string, error: unknown): void => {
    appLogger.error(message, { error });
};

export const logInfo = (message: string | object) =>
    appLogger.info(
        typeof message === 'object' ? safeStringify(message) : String(message)
    );

export const logWarn = (message: string | object) =>
    appLogger.warn(
        typeof message === 'object' ? safeStringify(message) : String(message)
    );

export const logData = (...messages: unknown[]) => {
    appLogger.debug(messages.map((m) => safeStringify(m)).join(' '));
};

export const logErrorConsole = (message: string | object, error?: unknown) => {
    const msg =
        typeof message === 'object' ? safeStringify(message) : String(message);
    logger.error(colors.error(msg));
    if (error) {
        const errMsg =
            error instanceof Error
                ? `${error.name}: ${error.message}\nStack: ${error.stack}`
                : safeStringify(error);
        logger.error(colors.error(errMsg));
    }
};
