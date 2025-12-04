import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdminAuthModule } from './modules/v1/admin/auth/auth.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { resolve } from 'path';
import { BodyLangResolver } from './i18n/body-lang.resolver';
import { QueryLangResolver } from './i18n/query-lang.resolver';
import { NotificationModule } from './notification/notification.module';
import { CronjobsService } from './cronjobs/cronjobs.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppContentService as AdminAppContentService } from './modules/v1/admin/app_content/app_content.service';
import { AppContentModule as AdminAppContentModule } from './modules/v1/admin/app_content/app_content.module';
import { AppContentController as AdminAppContentController } from './modules/v1/admin/app_content/app_content.controller';
import { FaqController } from './modules/v1/admin/faq/faq.controller';
import { FaqService } from './modules/v1/admin/faq/faq.service';
import { FaqModule } from './modules/v1/admin/faq/faq.module';
import { UsersModule } from './modules/v1/admin/users/users.module';
import { S3BucketModule } from './modules/v1/admin/bucket/bucket.module';
import { EnvValidatorService } from './startup/env-validator.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        AdminAuthModule,
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
        }),
        NotificationModule,
        AdminAppContentModule,
        FaqModule,
        UsersModule,
        S3BucketModule,
    ],
    controllers: [AppController, FaqController, AdminAppContentController],
    providers: [
        AppService,
        CronjobsService,
        EnvValidatorService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        AdminAppContentService,
        FaqService,
    ],
})
export class AppModule {}
