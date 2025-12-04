import { Module } from '@nestjs/common';
import { AppVersionService } from './app_version.service';
import { AppVersionController } from './app_version.controller';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';

@Module({
    controllers: [AppVersionController],
    providers: [AppVersionService, UserOnlyGuard],
})
export class AppVersionModule {}
