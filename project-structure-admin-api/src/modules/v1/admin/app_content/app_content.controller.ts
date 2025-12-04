import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpCode,
    Patch,
    Delete,
    Get,
    Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../../../../common/guards/role.guard';
import { AppContentService } from './app_content.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
    AddContentDto,
    EditContentDto,
    DeleteContentDto,
    GetContentDto,
} from './dto/app_content.dto';
import { translate } from '../../../../i18n/i18n.util';
import appContentExampleResponse from './responses/app_content.response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@ApiTags('Admin App Content')
@Controller('admin/v1/app-content')
export class AppContentController {
    constructor(
        private readonly appContentService: AppContentService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(appContentExampleResponse.ADD_CONTENT_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('add')
    @HttpCode(200)
    async addContent(@Body() dto: AddContentDto, @Res() res: Response) {
        try {
            const result = await this.appContentService.addContent(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            return internalErrorRes(
                translate(this.i18n, 'Internal server error.'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.EDIT_CONTENT_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Patch('edit')
    @HttpCode(200)
    async editContent(@Body() dto: EditContentDto, @Res() res: Response) {
        try {
            const result = await this.appContentService.editContent(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            return internalErrorRes(
                translate(this.i18n, 'Internal server error.'),
                error
            );
        }
    }

    @ApiResponse(appContentExampleResponse.DELETE_CONTENT_EXAMPLE)
    @ApiResponse(appContentExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Delete('delete')
    async deleteContent(@Body() dto: DeleteContentDto, @Res() res: Response) {
        try {
            const result = await this.appContentService.deleteContent(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            return internalErrorRes(
                translate(this.i18n, 'Internal server error.'),
                error
            );
        }
    }

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
                translate(this.i18n, 'Internal server error.'),
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
                translate(this.i18n, 'Internal server error.'),
                error
            );
        }
    }
}
