import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../../../../common/guards/role.guard';

@Module({
    providers: [AuthService, JwtAuthGuard, AdminOnlyGuard],
    controllers: [AuthController],
    exports: [JwtAuthGuard, AdminOnlyGuard],
})
export class AdminAuthModule {}
