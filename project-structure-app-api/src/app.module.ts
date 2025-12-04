import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { resolve } from 'path';
import { BodyLangResolver } from './i18n/body-lang.resolver';
import { QueryLangResolver } from './i18n/query-lang.resolver';
import { NotificationModule } from './notification/notification.module';
import { CronjobsService } from './cronjobs/cronjobs.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppVersionController } from './modules/v1/app/app_version/app_version.controller';
import { AppVersionService } from './modules/v1/app/app_version/app_version.service';
import { AppVersionModule } from './modules/v1/app/app_version/app_version.module';
import { AuthController } from './modules/v1/app/auth/auth.controller';
import { AuthService } from './modules/v1/app/auth/auth.service';
import { S3BucketModule } from './modules/v1/app/bucket/bucket.module';
import { S3BucketController } from './modules/v1/app/bucket/bucket.controller';
import { AppAuthModule } from './modules/v1/app/auth/auth.module';
import { AppContentController } from './modules/v1/app/app_content/app_content.controller';
import { AppContentService } from './modules/v1/app/app_content/app_content.service';
import { AppContentModule } from './modules/v1/app/app_content/app_content.module';
import { AppCreadsService } from './modules/v1/app/app_creads/app_creads.service';
import { AppCreadsModule } from './modules/v1/app/app_creads/app_creads.module';
import { AppCreadsController } from './modules/v1/app/app_creads/app_creads.controller';
import { SupportModule } from './modules/v1/app/support/support.module';
import { NotificationController } from './modules/v1/app/notification/notification.controller';
import { EnvValidatorService } from './startup/env-validator.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        AppAuthModule,
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: resolve(process.cwd(), 'src/i18n'),
                watch: true,
            },
            resolvers: [
                { use: QueryLangResolver, options: ['ln'] },
                { use: BodyLangResolver, options: ['ln'] },
                AcceptLanguageResolver,
            ],
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: Number(process.env.RATE_LIMIT_TTL ?? 60000),
                    limit: Number(process.env.RATE_LIMIT_LIMIT ?? 20),
                },
            ],
            errorMessage: 'Too many requests, please try again later.',
        }),
        NotificationModule,
        AppContentModule,
        AppVersionModule,
        S3BucketModule,
        AppCreadsModule,
        SupportModule,
    ],
    controllers: [
        AppController,
        AppVersionController,
        S3BucketController,
        AuthController,
        AppContentController,
        AppCreadsController,
        NotificationController,
    ],
    providers: [
        AppService,
        CronjobsService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        AppContentService,
        AppCreadsService,
        AppVersionService,
        AuthService,
        EnvValidatorService,
    ],
})
export class AppModule {}
