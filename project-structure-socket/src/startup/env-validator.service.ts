import { Injectable, OnModuleInit } from '@nestjs/common';
import { logInfo, logWarn } from '../utils/logger';

@Injectable()
export class EnvValidatorService implements OnModuleInit {
    onModuleInit(): void {
        const required = [
            'DB_NAME',
            'DB_PORT',
            'REGION',
            'SECRET_NAME',
            'TOKEN_KEY',
            'TOKEN_ISSUER',
            'TOKEN_AUDIENCE',
            'BUCKET_NAME',
            'CORS_ALLOWED_ORIGINS',
        ];

        const missing = required.filter(
            (k) => !process.env[k] || process.env[k] === ''
        );
        if (missing.length) {
            logWarn(
                `Missing required environment variables: ${missing.join(', ')}`
            );
        }

        const numericKeys = [
            'DB_PORT',
            'RATE_LIMIT_TTL',
            'RATE_LIMIT_LIMIT',
            'WINNINGS_POOL_PERCENT',
            'ADMIN_EARNINGS_PERCENT',
            'REFERRAL_COMMISSION_PERCENT',
            'ADMIN_NO_SHOW_MINUTES',
            'WINNINGS_AVAILABLE_AFTER',
            'AFFILIATE_COMMISSION_AVAILABLE_AFTER',
            'PORT',
            'S3_SIGNED_URL_TTL_SECONDS',
            'TESTING_INVITE_EMAILS',
        ];

        const missingNumeric = numericKeys.filter(
            (k) => !process.env[k] || process.env[k] === ''
        );
        if (missingNumeric.length) {
            logWarn(
                `Missing required environment variables: ${missingNumeric.join(', ')}`
            );
        }

        const optionalWarnIfMissing = [
            'SENTRY_DSN',
            'SERVER_ENVIRONMENT',
            'SENTRY_SEND_DEFAULT_PII',
            'SENTRY_LOG_LEVEL',
            'FIREBASE_PROJECT_ID',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_PRIVATE_KEY',
            'OPENAI_MODEL',
            'HOST',
            'I18N_DEFAULT_NS',
            'DB_SSL',
            'NODE_ENV',
        ];

        const missingOptional = optionalWarnIfMissing.filter(
            (k) => !process.env[k] || process.env[k] === ''
        );
        if (missingOptional.length) {
            logWarn(
                `Optional environment variables not set: ${missingOptional.join(', ')}`
            );
        }

        logInfo('Environment variables validated successfully');
    }
}
