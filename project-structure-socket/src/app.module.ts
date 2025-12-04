import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EnvValidatorService } from './startup/env-validator.service';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { resolve } from 'path';
import { BodyLangResolver } from './i18n/body-lang.resolver';
import { NotificationModule } from './notification/notification.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { IndexModule } from './modules/v1/index.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: resolve(process.cwd(), 'src/i18n'),
                watch: true,
            },
            resolvers: [
                { use: BodyLangResolver, options: ['ln'] },
                AcceptLanguageResolver,
            ],
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
                    limit: Number(process.env.RATE_LIMIT_LIMIT ?? 100),
                },
            ],
        }),
        NotificationModule,
        IndexModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        EnvValidatorService,
    ],
})
export class AppModule {}
