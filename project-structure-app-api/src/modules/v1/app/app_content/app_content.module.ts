import { Module } from '@nestjs/common';
import { AppContentController } from './app_content.controller';
import { AppContentService } from './app_content.service';
import { AppAuthModule } from '../auth/auth.module';

@Module({
    imports: [AppAuthModule],
    controllers: [AppContentController],
    providers: [AppContentService],
})
export class AppContentModule {}
