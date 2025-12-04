import { Injectable } from '@nestjs/common';
import { GetContentDto } from './dto/app_content.dto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { AppContent, appContents } from 'project-structure-database';
import {
    ServiceResponse,
    serviceSuccess,
    serviceError,
    servicecatch,
} from '../../../../common/service-response';
import { logError } from '../../../../utils/logger';

@Injectable()
export class AppContentService {
    constructor() {}

    async getContent(dto: GetContentDto): Promise<ServiceResponse<AppContent>> {
        try {
            const { content_type } = dto;

            const [find_content] = await db
                .select()
                .from(appContents)
                .where(
                    and(
                        eq(appContents.content_type, content_type),
                        eq(appContents.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_content) {
                return serviceError('CONTENT_NOT_FOUND');
            }

            return serviceSuccess('CONTENT_GET', find_content);
        } catch (error) {
            logError('getContent', error);
            return servicecatch('CONTENT_GET_FAILED', error);
        }
    }

    async getAllContent(): Promise<ServiceResponse<AppContent[]>> {
        try {
            const data = await db
                .select()
                .from(appContents)
                .orderBy(desc(appContents.created_at))
                .where(eq(appContents.is_deleted, false));

            if (data.length === 0) {
                return serviceError('CONTENT_NOT_FOUND');
            }

            return serviceSuccess('CONTENT_LIST', data);
        } catch (error) {
            logError('getAllContent', error);
            return servicecatch('CONTENT_LIST_FAILED', error);
        }
    }
}
