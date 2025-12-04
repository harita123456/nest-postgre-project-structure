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
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'STRIPE_REFRESH_URL',
            'STRIPE_RETURN_URL',
            'MAIL_HOST',
            'MAIL_PORT',
            'MAIL_FROM_ADDRESS',
            'MAIL_PASSWORD',
            'SUPPORT_MAIL',
            'AGORA_APP_ID',
            'AGORA_APP_CERTIFICATE',
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
            'PORT',
            'MAIL_PORT',
            'RATE_LIMIT_TTL',
            'RATE_LIMIT_LIMIT',
            'S3_SIGNED_URL_TTL_SECONDS',
            'OTP_EXPIRE_AFTER_MIN',
            'REFRESH_TOKEN_TTL_DAYS',
            'BCRYPT_SALT_ROUNDS',
            'AGORA_TOKEN_TTL_SECONDS',
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
            'NODE_ENV',
            'HOST',
            'SERVER_ENVIRONMENT',
            'DB_SSL',
            'DB_CREATE_ON_START',
            'DB_MIGRATE_ON_START',
            'DB_SEED_ON_START',
            'DRIZZLE_MIGRATIONS_FOLDER',
            'TOKEN_EXPIRES_IN',
            'SENTRY_DSN',
            'SENTRY_SEND_DEFAULT_PII',
            'SENTRY_LOG_LEVEL',
            'FIREBASE_PROJECT_ID',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_PRIVATE_KEY',
            'I18N_DEFAULT_NS',
            'LOGO_PATH',
            'SWAGGER_BASIC_USER',
            'SWAGGER_BASIC_PASS',
            'SWAGGER_URL_LOCAL',
            'SWAGGER_URL_DEV',
            'SWAGGER_URL_STAGE',
            'SWAGGER_URL_LIVE',
            'ALGORITHM',
            'INITVECTOR',
            'SECURITYKEY',
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
