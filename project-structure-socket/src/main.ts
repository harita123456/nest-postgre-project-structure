import 'dotenv/config';
import './utils/sentry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDatabase } from './database';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { logInfo } from './utils/logger';
import { setupExpressErrorHandler } from '@sentry/nestjs';
import { areSecretsInitialized, initializeSecrets } from './config/secrets';

async function bootstrap() {
    if (!areSecretsInitialized()) {
        await initializeSecrets();
    }
    await connectToDatabase();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn'],
    });

    app.use(helmet());

    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    const isProd = (process.env.NODE_ENV || 'development') === 'production';
    const corsOrigin = isProd
        ? allowedOrigins.length
            ? allowedOrigins
            : false
        : true;

    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'Accept-Language',
            'Origin',
        ],
        maxAge: 600,
    });

    app.use(compression());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
        new I18nValidationPipe()
    );

    app.useGlobalFilters(
        new GlobalExceptionFilter(),
        new I18nValidationExceptionFilter({
            detailedErrors: false,
        })
    );

    setupExpressErrorHandler(app);

    const port = Number(process.env.PORT) || 9000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, host);
    const url = await app.getUrl();

    logInfo(`🚀 Application is running on: ${url}`);
    logInfo(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}
void bootstrap();
