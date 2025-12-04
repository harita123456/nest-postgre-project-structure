import { Module } from '@nestjs/common';
import { AppContentController } from './app_content.controller';
import { AppContentService } from './app_content.service';
import { AdminAuthModule } from '../auth/auth.module';

@Module({
    imports: [AdminAuthModule],
    controllers: [AppContentController],
    providers: [AppContentService],
})
export class AppContentModule {}
