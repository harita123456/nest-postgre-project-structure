import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminAuthModule } from '../auth/auth.module';

@Module({
    imports: [AdminAuthModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
