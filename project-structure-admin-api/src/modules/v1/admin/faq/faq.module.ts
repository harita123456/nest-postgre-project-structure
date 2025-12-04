import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { AdminAuthModule } from '../auth/auth.module';

@Module({
    imports: [AdminAuthModule],
    controllers: [FaqController],
    providers: [FaqService],
})
export class FaqModule {}
