import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, UserOnlyGuard],
})
export class AppAuthModule {}
