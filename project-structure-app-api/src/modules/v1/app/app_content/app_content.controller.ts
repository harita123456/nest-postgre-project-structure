import { Controller, Res, Get, Query } from '@nestjs/common';
import { AppContentService } from './app_content.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { GetContentDto } from './dto/app_content.dto';
import { translate } from '../../../../i18n/i18n.util';
import appContentExampleResponse from './responses/app_content.response';

@ApiTags('App Content')
@Controller('app/v1/app-content')
export class AppContentController {
    constructor(
        private readonly appContentService: AppContentService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(appContentExampleResponse.GET_CONTENT_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('get')
    async getContent(@Query() dto: GetContentDto, @Res() res: Response) {
        try {
            const result = await this.appContentService.getContent(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error) {
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.GET_ALL_CONTENT_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('get-all')
    async getAllContent(@Res() res: Response) {
        try {
            const result = await this.appContentService.getAllContent();

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error) {
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
