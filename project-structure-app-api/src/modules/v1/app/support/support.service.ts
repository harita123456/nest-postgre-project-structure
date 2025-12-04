import { Injectable } from '@nestjs/common';
import { db } from '../../../../database/connection';
import { Support, supports } from 'project-structure-database';
import {
    ServiceResponse,
    serviceSuccess,
    serviceError,
    servicecatch,
} from '../../../../common/service-response';
import { logError } from '../../../../utils/logger';
import { CreateSupportDto } from './dto/support.dto';
import { sendSupportEmail } from '../../../../utils/mailer.util';

@Injectable()
export class SupportService {
    constructor() {}

    async createSupport(
        dto: CreateSupportDto
    ): Promise<ServiceResponse<Support>> {
        try {
            const [created] = await db
                .insert(supports)
                .values({
                    full_name: dto.first_name + ' ' + dto.last_name,
                    email_address: dto.email_address,
                    subject: dto.subject,
                    message: dto.message,
                    attachment_url: dto.attachment_url ?? null,
                })
                .returning();

            if (!created) {
                return serviceError('SUPPORT_CREATION_FAILED');
            }

            sendSupportEmail({
                subject: dto.subject,
                message: dto.message,
                userEmail: dto.email_address,
                userName: dto.first_name + ' ' + dto.last_name,
                attachmentUrl: dto.attachment_url ?? null,
            }).catch((err) => logError('sendSupportEmail', err));

            return serviceSuccess('SUPPORT_CREATED', created);
        } catch (error: unknown) {
            logError('createSupport', error);
            return servicecatch('CREATE_SUPPORT_ERROR', error);
        }
    }
}
