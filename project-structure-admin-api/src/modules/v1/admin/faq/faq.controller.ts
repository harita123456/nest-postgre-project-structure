import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    Res,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../../../../common/guards/role.guard';
import { FaqService } from './faq.service';
import {
    successRes,
    errorRes,
    multiSuccessRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
    AddFaqDto,
    EditFaqDto,
    DeleteFaqDto,
    ListFaqDto,
    ActiveDeactiveFaqDto,
} from './dto/faq.dto';
import { translate } from '../../../../i18n/i18n.util';
import faqExampleResponse from './responses/faq.response';
import { logError } from '../../../../utils/logger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@ApiTags('Faq')
@Controller('admin/v1/faq')
export class FaqController {
    constructor(
        private readonly faqService: FaqService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(faqExampleResponse.ADD_FAQ_EXAMPLE)
    @ApiResponse(faqExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('add')
    async addFaq(@Body() dto: AddFaqDto, @Res() res: Response) {
        try {
            const result = await this.faqService.addFaq(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('ADD_FAQ_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(faqExampleResponse.EDIT_FAQ_EXAMPLE)
    @ApiResponse(faqExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('edit')
    async editFaq(dto: EditFaqDto, @Res() res: Response) {
        try {
            const result = await this.faqService.editFaq(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result
            );
        } catch (error: unknown) {
            logError('EDIT_FAQ_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(faqExampleResponse.DELETE_FAQ_EXAMPLE)
    @ApiResponse(faqExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('delete')
    async deleteFaq(dto: DeleteFaqDto, @Res() res: Response) {
        try {
            const result = await this.faqService.deleteFaq(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(res, translate(this.i18n, result.message), []);
        } catch (error: unknown) {
            logError('DELETE_FAQ_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(faqExampleResponse.LIST_FAQ_EXAMPLE)
    @ApiResponse(faqExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('list')
    async listFaq(dto: ListFaqDto, @Res() res: Response) {
        const result = await this.faqService.listFaq(dto);

        if (!result.success) {
            return errorRes(res, translate(this.i18n, result.message));
        }
        return multiSuccessRes(
            res,
            translate(this.i18n, result.message),
            result.total ?? 0,
            result.data ?? []
        );
    }

    @ApiResponse(faqExampleResponse.ACTIVE_DEACTIVE_FAQ_EXAMPLE)
    @ApiResponse(faqExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('active-deactive')
    async activateDeactiveFaq(
        @Body(new ValidationPipe({ whitelist: true, transform: true }))
        dto: ActiveDeactiveFaqDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.faqService.activeDeactiveFaq(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(res, translate(this.i18n, result.message), []);
        } catch (error: unknown) {
            logError('ACTIVE_DEACTIVE_FAQ_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
