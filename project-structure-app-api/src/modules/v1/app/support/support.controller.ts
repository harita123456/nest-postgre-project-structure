import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';
import { translate } from '../../../../i18n/i18n.util';
import { CreateSupportDto } from './dto/support.dto';
import { SupportService } from './support.service';
import supportExampleResponse from './responses/support.response';
import { logError } from '../../../../utils/logger';
import { Support } from 'project-structure-database';

@ApiTags('App Support')
@Controller('app/v1/support')
export class SupportController {
    constructor(
        private readonly supportService: SupportService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(supportExampleResponse.CREATE_SUPPORT_EXAMPLE)
    @ApiResponse(supportExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('create')
    async createSupport(
        @Body() dto: CreateSupportDto,
        @Res() res: Response
    ): Promise<ApiResponseType<Support | null>> {
        try {
            const result = await this.supportService.createSupport(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('CREATE_SUPPORT_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
