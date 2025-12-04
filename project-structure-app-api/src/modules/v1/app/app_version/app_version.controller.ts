import {
    Controller,
    Post,
    Res,
    Patch,
    Get,
    Query,
    Body,
    HttpCode,
} from '@nestjs/common';
import { AppVersionService, VersionCheckResult } from './app_version.service';
import { successRes } from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import {
    AddAppVersionDto,
    AppVersionCheckDto,
    UpdateAppVersionDto,
} from './dto/app_version.dto';
import { logError } from '../../../../utils/logger';
import appVersionExampleResponse from './responses/app_version.response';

import { errorRes } from '../../../../common/responses.common';
import { translate } from '../../../../i18n/i18n.util';
import { internalErrorRes } from '../../../../common/responses.common';
import { AppVersion } from 'project-structure-database';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';

@ApiTags('App Version')
@Controller('app/v1/app-version')
export class AppVersionController {
    constructor(
        private readonly appVersionService: AppVersionService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(appVersionExampleResponse.ADD_APP_VERSION_EXAMPLE)
    @ApiResponse(appVersionExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('add-app-version')
    async addAppVersion(
        @Body() data: AddAppVersionDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppVersion | null>> {
        try {
            const checkVersion =
                await this.appVersionService.getAppVersion(data);

            if (checkVersion.success) {
                return errorRes(
                    res,
                    translate(this.i18n, 'APP_VERSION_ALREADY_EXISTS')
                );
            }

            const result = await this.appVersionService.addAppVersion(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('ADD_APP_VERSION_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appVersionExampleResponse.APP_VERSION_CHECK_EXAMPLE)
    @ApiResponse(appVersionExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('app-version-check')
    async appVersionCheck(
        @Query() data: AppVersionCheckDto,
        @Res() res: Response
    ): Promise<ApiResponseType<VersionCheckResult | null>> {
        try {
            const result = await this.appVersionService.appVersionCheck(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('APP_VERSION_CHECK_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appVersionExampleResponse.UPDATE_APP_VERSION_EXAMPLE)
    @ApiResponse(appVersionExampleResponse.NOT_FOUND_EXAMPLE)
    @ApiResponse(appVersionExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Patch('update-app-version')
    async updateAppVersion(
        @Body() data: UpdateAppVersionDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppVersion | null>> {
        try {
            const checkVersion =
                await this.appVersionService.getAppVersion(data);

            if (!checkVersion.success) {
                return errorRes(
                    res,
                    translate(this.i18n, checkVersion.message)
                );
            }

            const result = await this.appVersionService.updateAppVersion(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('UPDATE_APP_VERSION_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
