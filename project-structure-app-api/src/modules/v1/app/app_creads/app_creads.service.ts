import { Injectable } from '@nestjs/common';
import {
    AddAppCreadDto,
    UpdateAppCreadDto,
    GetAppCreadDto,
    DeleteAppCreadDto,
} from './dto/app_creads.dto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { AppCread, appCreads } from 'project-structure-database';
import {
    ServiceResponse,
    serviceSuccess,
    serviceError,
    servicecatch,
} from '../../../../common/service-response';
import { logError } from '../../../../utils/logger';

@Injectable()
export class AppCreadsService {
    constructor() {}

    async addAppCread(dto: AddAppCreadDto): Promise<ServiceResponse<AppCread>> {
        try {
            const { app_key, app_secret, environment } = dto;

            const [find_app_cread] = await db
                .select()
                .from(appCreads)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment),
                        eq(appCreads.app_secret, app_secret),
                        eq(appCreads.is_deleted, false)
                    )
                )
                .limit(1);

            if (find_app_cread) {
                return serviceError('APP_CREAD_ALREADY_EXISTS');
            }

            const [result] = await db.insert(appCreads).values(dto).returning();

            if (!result) {
                return serviceError('APP_CREAD_NOT_ADDED');
            }

            return serviceSuccess('APP_CREAD_ADDED', result);
        } catch (error) {
            logError('addAppCread', error);
            return servicecatch('APP_CREAD_ADD_FAILED', error);
        }
    }

    async updateAppCread(
        dto: UpdateAppCreadDto
    ): Promise<ServiceResponse<AppCread | null>> {
        try {
            const { app_key, app_secret, environment } = dto;

            const [find_app_cread] = await db
                .select()
                .from(appCreads)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment),
                        eq(appCreads.app_secret, app_secret),
                        eq(appCreads.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_app_cread) {
                return serviceError('APP_CREAD_NOT_FOUND');
            }

            const [result] = await db
                .update(appCreads)
                .set(dto)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment),
                        eq(appCreads.app_secret, app_secret),
                        eq(appCreads.is_deleted, false)
                    )
                )
                .returning();

            if (!result) {
                return serviceError('APP_CREAD_NOT_UPDATED');
            }

            return serviceSuccess('APP_CREAD_UPDATED', result);
        } catch (error) {
            logError('updateAppCread', error);
            return servicecatch('APP_CREAD_UPDATE_FAILED', error);
        }
    }

    async getAppCread(dto: GetAppCreadDto): Promise<ServiceResponse<AppCread>> {
        try {
            const { app_key, environment } = dto;

            const [find_app_cread] = await db
                .select()
                .from(appCreads)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment),
                        eq(appCreads.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_app_cread) {
                return serviceError('APP_CREAD_NOT_FOUND');
            }

            return serviceSuccess('APP_CREAD_FOUND', find_app_cread);
        } catch (error) {
            logError('getAppCread', error);
            return servicecatch('APP_CREAD_GET_FAILED', error);
        }
    }

    async deleteAppCread(
        dto: DeleteAppCreadDto
    ): Promise<ServiceResponse<AppCread | null>> {
        try {
            const { app_key, environment } = dto;

            const [find_app_cread] = await db
                .select()
                .from(appCreads)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment),
                        eq(appCreads.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_app_cread) {
                return serviceError('APP_CREAD_NOT_FOUND');
            }

            const result = await db
                .delete(appCreads)
                .where(
                    and(
                        eq(appCreads.app_key, app_key),
                        eq(appCreads.environment, environment)
                    )
                );

            if (!result) {
                return serviceError('APP_CREAD_NOT_DELETED');
            }

            return serviceSuccess('APP_CREAD_DELETED', null);
        } catch (error) {
            logError('deleteAppCread', error);
            return servicecatch('APP', error);
        }
    }

    async getAllAppCreads(): Promise<ServiceResponse<AppCread[]>> {
        try {
            const data = await db
                .select()
                .from(appCreads)
                .orderBy(desc(appCreads.created_at))
                .where(eq(appCreads.is_deleted, false));

            if (data.length === 0) {
                return serviceError('APP_CREAD_NOT_FOUND');
            }

            return serviceSuccess('APP_CREAD_LIST', data);
        } catch (error) {
            logError('getAllAppCreads', error);
            return servicecatch('APP_CREAD_LIST_FAILED', error);
        }
    }
}
