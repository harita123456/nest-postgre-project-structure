import {
    Controller,
    Res,
    Get,
    Query,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common';
import { AppCreadsService } from './app_creads.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import {
    AddAppCreadDto,
    DeleteAppCreadDto,
    GetAppCreadDto,
    UpdateAppCreadDto,
} from './dto/app_creads.dto';
import { translate } from '../../../../i18n/i18n.util';
import appContentExampleResponse from './responses/app_content.response';
import { AppCread } from 'project-structure-database';
import { logError } from '../../../../utils/logger';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserOnlyGuard)
@ApiTags('App Credentails')
@Controller('app/v1/app-creads')
export class AppCreadsController {
    constructor(
        private readonly appCreadsService: AppCreadsService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(appContentExampleResponse.GET_APP_CREAD_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('get-app-cread')
    async getAppCread(
        @Query() data: GetAppCreadDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppCread | null>> {
        try {
            const result = await this.appCreadsService.getAppCread(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('GET_APP_CREAD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.ADD_APP_CREAD_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('add-app-cread')
    async addAppCread(
        @Body() data: AddAppCreadDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppCread | null>> {
        try {
            const result = await this.appCreadsService.addAppCread(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('ADD_APP_CREAD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.UPDATE_APP_CREAD_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Put('update-app-cread')
    async updateAppCread(
        @Body() data: UpdateAppCreadDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppCread | null>> {
        try {
            const result = await this.appCreadsService.updateAppCread(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('UPDATE_APP_CREAD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.DELETE_APP_CREAD_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Delete('delete-app-cread')
    async deleteAppCread(
        @Body() data: DeleteAppCreadDto,
        @Res() res: Response
    ): Promise<ApiResponseType<AppCread | null>> {
        try {
            const result = await this.appCreadsService.deleteAppCread(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('DELETE_APP_CREAD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
