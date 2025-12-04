import 'dotenv/config';
import './utils/sentry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDatabase } from './database';
import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
    captureResponseBody,
    setupExpressErrorHandler,
} from './utils/sentry_middleware';
import { logInfo } from './utils/logger';
import type { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { areSecretsInitialized, initializeSecrets } from './config/secrets';

async function bootstrap() {
    if (!areSecretsInitialized()) {
        await initializeSecrets();
    }
    await connectToDatabase();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn'],
    });

    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    const isProd = (process.env.NODE_ENV || 'development') === 'production';

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (isProd && !allowedOrigins.includes(origin)) {
                return callback(new Error('Not allowed by CORS'), false);
            }
            callback(null, true);
        },
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

    app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

    if (process.env.NODE_ENV !== 'production') {
        app.use(
            helmet({
                crossOriginOpenerPolicy: false,
                crossOriginEmbedderPolicy: false,
                crossOriginResourcePolicy: { policy: 'cross-origin' },
                hsts: false,
                contentSecurityPolicy: false,
            })
        );
    } else {
        app.use(helmet());
    }

    app.use(captureResponseBody);

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

    if ((process.env.NODE_ENV || 'development') !== 'production') {
        app.use(morgan('dev'));
    }

    setupExpressErrorHandler(app);

    const enableSwagger =
        (process.env.NODE_ENV || 'development') !== 'production';

    if (enableSwagger) {
        const swaggerUser = process.env.SWAGGER_BASIC_USER;
        const swaggerPass = process.env.SWAGGER_BASIC_PASS;

        if (swaggerUser && swaggerPass) {
            app.use(
                '/apis',
                (req: Request, res: Response, next: NextFunction) => {
                    const authHeader = req.headers.authorization || '';
                    if (!authHeader.startsWith('Basic ')) {
                        res.setHeader('WWW-Authenticate', 'Basic realm="docs"');
                        return res.status(401).send('Authentication required.');
                    }
                    const base64 = authHeader.split(' ')[1] || '';
                    const [user, pass] = Buffer.from(base64, 'base64')
                        .toString('utf8')
                        .split(':');
                    if (user === swaggerUser && pass === swaggerPass)
                        return next();
                    res.setHeader('WWW-Authenticate', 'Basic realm="docs"');
                    return res.status(401).send('Unauthorized');
                }
            );
        }
        const normalizeServerUrl = (u?: string): string | undefined => {
            if (!u) return undefined;
            let s = u.trim();
            if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) {
                s = `http://${s}`;
            }
            s = s.replace(/\/+$/, '');
            return s;
        };

        const swaggerServers: Array<{ url: string; description: string }> = [];
        const sLocal = normalizeServerUrl(process.env.SWAGGER_URL_LOCAL);
        if (sLocal) swaggerServers.push({ url: sLocal, description: 'Local' });
        const sDev = normalizeServerUrl(process.env.SWAGGER_URL_DEV);
        if (sDev)
            swaggerServers.push({ url: sDev, description: 'Development' });
        const sStage = normalizeServerUrl(process.env.SWAGGER_URL_STAGE);
        if (sStage)
            swaggerServers.push({ url: sStage, description: 'Staging' });
        const sLive = normalizeServerUrl(process.env.SWAGGER_URL_LIVE);
        if (sLive) swaggerServers.push({ url: sLive, description: 'Live' });

        let builder = new DocumentBuilder()
            .setTitle('project-structure App Api')
            .setDescription('project-structure App Api Documentation')
            .setVersion('1.0')
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            });

        for (const s of swaggerServers) {
            builder = builder.addServer(s.url, s.description);
        }
        builder = builder.addServer('/', 'Same Origin');

        const config = builder.build();

        const document = SwaggerModule.createDocument(app, config, {
            extraModels: [],
            deepScanRoutes: true,
        });

        if (swaggerServers.length === 0) {
            document.servers = [{ url: '/', description: 'Same Origin' }];
        }

        SwaggerModule.setup('apis', app, document, {
            customSiteTitle: 'API Docs',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
            },
        });
    }

    const port = Number(process.env.PORT) || 9000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, host);
    const url = await app.getUrl();

    logInfo(`🚀 Application is running on: ${url}`);
    logInfo(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}
void bootstrap();
