import { Module } from '@nestjs/common';
import { AppCreadsController } from './app_creads.controller';
import { AppCreadsService } from './app_creads.service';
import { AppAuthModule } from '../auth/auth.module';

@Module({
    imports: [AppAuthModule],
    controllers: [AppCreadsController],
    providers: [AppCreadsService],
})
export class AppCreadsModule {}
