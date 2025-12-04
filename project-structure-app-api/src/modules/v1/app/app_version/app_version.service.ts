import { Injectable } from '@nestjs/common';
import {
    AddAppVersionDto,
    AppVersionCheckDto,
    UpdateAppVersionDto,
} from './dto/app_version.dto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { appVersions, AppVersion } from 'project-structure-database';
import { logData, logError } from '../../../../utils/logger';
import {
    serviceSuccess,
    servicecatch,
    serviceError,
    ServiceResponse,
} from '../../../../common/service-response';
import { I18nService } from 'nestjs-i18n';
import { translate } from '../../../../i18n/i18n.util';

export interface VersionCheckResult {
    is_need_update?: boolean;
    is_force_update?: boolean;
    is_maintenance?: boolean;
}

@Injectable()
export class AppVersionService {
    constructor(private readonly i18n: I18nService) {}
    async addAppVersion(
        data: AddAppVersionDto
    ): Promise<ServiceResponse<AppVersion>> {
        try {
            const {
                app_version,
                is_maintenance,
                app_update_status,
                app_platform,
                app_url,
                api_base_url,
                is_live,
            } = data;

            const [insert_app_version] = await db
                .insert(appVersions)
                .values({
                    app_version: app_version,
                    is_maintenance: is_maintenance,
                    app_update_status: app_update_status,
                    app_platform: app_platform,
                    app_url: app_url,
                    api_base_url: api_base_url,
                    is_live: is_live,
                })
                .returning();

            return serviceSuccess(
                translate(this.i18n, 'ADD_APP_VERSION_SUCCESS'),
                insert_app_version
            );
        } catch (error: unknown) {
            logError('ADD_APP_VERSION_ERROR', error);
            return servicecatch(
                translate(this.i18n, 'ADD_APP_VERSION_ERROR'),
                error
            );
        }
    }

    async appVersionCheck(
        data: AppVersionCheckDto
    ): Promise<ServiceResponse<VersionCheckResult>> {
        try {
            const { app_version, app_platform } = data;

            const result: VersionCheckResult = {};

            const [check_version] = await db
                .select()
                .from(appVersions)
                .where(
                    and(
                        eq(appVersions.app_version, app_version),
                        eq(appVersions.is_live, true),
                        eq(appVersions.app_platform, app_platform),
                        eq(appVersions.is_deleted, false)
                    )
                )
                .limit(1);

            logData('CHECK_LATEST_VERSION', check_version);

            let app_update_status = '';

            if (check_version) {
                app_update_status = check_version.app_update_status;

                result.is_need_update = false;
                result.is_force_update = false;
                result.is_maintenance = check_version.is_maintenance;
            } else {
                const [latestVersion] = await db
                    .select()
                    .from(appVersions)
                    .where(
                        and(
                            eq(appVersions.is_live, true),
                            eq(appVersions.app_platform, app_platform),
                            eq(appVersions.is_deleted, false)
                        )
                    )
                    .orderBy(desc(appVersions.app_version))
                    .limit(1);

                logData('LATEST_VERSION', latestVersion);

                app_update_status = latestVersion?.app_update_status ?? '';

                if (app_update_status === 'is_force_update') {
                    result.is_need_update = true;
                    result.is_force_update = true;
                    result.is_maintenance =
                        latestVersion?.is_maintenance ?? false;
                } else {
                    result.is_need_update = true;
                    result.is_force_update = false;
                    result.is_maintenance =
                        latestVersion?.is_maintenance ?? false;
                }
            }

            return serviceSuccess(
                translate(this.i18n, 'APP_VERSION_CHECK_SUCCESS'),
                result
            );
        } catch (error: unknown) {
            logError('APP_VERSION_CHECK_ERROR', error);
            return servicecatch(
                translate(this.i18n, 'APP_VERSION_CHECK_ERROR'),
                error
            );
        }
    }

    async updateAppVersion(
        data: UpdateAppVersionDto
    ): Promise<ServiceResponse<AppVersion | null>> {
        try {
            const { app_version, app_platform } = data;

            const [update_app_version] = await db
                .update(appVersions)
                .set({
                    app_update_status: data.app_update_status,
                    app_url: data.app_url,
                    api_base_url: data.api_base_url,
                    is_maintenance: data.is_maintenance,
                    is_live: data.is_live,
                })
                .where(
                    and(
                        eq(appVersions.app_version, app_version),
                        eq(appVersions.app_platform, app_platform)
                    )
                )
                .returning();

            if (!update_app_version) {
                return serviceError(
                    translate(this.i18n, 'APP_VERSION_NOT_FOUND')
                );
            }

            return serviceSuccess(
                translate(this.i18n, 'UPDATE_APP_VERSION_SUCCESS'),
                update_app_version
            );
        } catch (error: unknown) {
            logError('UPDATE_APP_VERSION_ERROR', error);
            return servicecatch(
                translate(this.i18n, 'UPDATE_APP_VERSION_ERROR'),
                error
            );
        }
    }

    async getAppVersion(
        data: AppVersionCheckDto
    ): Promise<ServiceResponse<AppVersion | null>> {
        try {
            const { app_version, app_platform } = data;

            const [appVersion] = await db
                .select()
                .from(appVersions)
                .orderBy(desc(appVersions.created_at))
                .where(
                    and(
                        eq(appVersions.is_deleted, false),
                        eq(appVersions.app_platform, app_platform),
                        eq(appVersions.app_version, app_version)
                    )
                )
                .limit(1);

            if (!appVersion) {
                return serviceError(
                    translate(this.i18n, 'APP_VERSION_NOT_FOUND')
                );
            }

            return serviceSuccess(
                translate(this.i18n, 'APP_VERSION_FOUND'),
                appVersion
            );
        } catch (error: unknown) {
            logError('GET_APP_VERSION_ERROR', error);
            return servicecatch(
                translate(this.i18n, 'GET_APP_VERSION_ERROR'),
                error
            );
        }
    }
}
