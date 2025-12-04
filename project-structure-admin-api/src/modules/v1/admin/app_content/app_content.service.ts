import { Injectable } from '@nestjs/common';
import {
    AddContentDto,
    EditContentDto,
    DeleteContentDto,
    GetContentDto,
} from './dto/app_content.dto';
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

    async addContent(dto: AddContentDto): Promise<ServiceResponse<AppContent>> {
        try {
            const { content_type, content } = dto;

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

            if (find_content) {
                return serviceError('CONTENT_ALREADY_EXISTS');
            }

            const [createdContent] = await db
                .insert(appContents)
                .values({
                    content_type: content_type,
                    content: content,
                })
                .returning();

            return serviceSuccess('CONTENT_CREATE', createdContent);
        } catch (error: unknown) {
            logError('addContent', error);
            return servicecatch('addContent', error);
        }
    }

    async editContent(
        dto: EditContentDto
    ): Promise<ServiceResponse<AppContent>> {
        try {
            const { content_id, content_type, content } = dto;

            const [find_content] = await db
                .select()
                .from(appContents)
                .where(
                    and(
                        eq(appContents.id, content_id),
                        eq(appContents.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_content) {
                return serviceError('CONTENT_NOT_FOUND');
            }

            const [updatedContent] = await db
                .update(appContents)
                .set({
                    content_type: content_type,
                    content: content,
                    updated_at: new Date(),
                })
                .where(eq(appContents.id, content_id))
                .returning();

            return serviceSuccess('CONTENT_UPDATE', updatedContent);
        } catch (error: unknown) {
            logError('editContent', error);
            return servicecatch('editContent', error);
        }
    }

    async deleteContent(
        dto: DeleteContentDto
    ): Promise<ServiceResponse<AppContent>> {
        try {
            const { content_id } = dto;

            const [find_content] = await db
                .select()
                .from(appContents)
                .where(
                    and(
                        eq(appContents.id, content_id),
                        eq(appContents.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_content) {
                return serviceError('CONTENT_NOT_FOUND');
            }

            await db
                .update(appContents)
                .set({ is_deleted: true })
                .where(eq(appContents.id, content_id));

            return serviceSuccess('CONTENT_DELETE', null);
        } catch (error) {
            logError('deleteContent', error);
            return servicecatch('deleteContent', error);
        }
    }

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
            return servicecatch('getContent', error);
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
            return servicecatch('getAllContent', error);
        }
    }
}
