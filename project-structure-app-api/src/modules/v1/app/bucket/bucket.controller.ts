import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpCode,
    Get,
    Query,
    Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';
import {
    successRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import {
    generateUploadURL,
    generateDownloadURL,
    deleteObject as deleteS3Object,
} from '../../../../utils/aws-s3.util';
import { Response } from 'express';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';
import type {
    S3UrlResponse,
    S3DownloadResponse,
} from '../../../../utils/aws-s3.util';
import {
    GenerateUploadUrlDto,
    GenerateDownloadUrlDto,
    DeleteFileDto,
} from '../auth/dto/auth.dto';
import { logError } from '../../../../utils/logger';
import { translate } from '../../../../i18n/i18n.util';

@ApiTags('S3 Bucket')
@UseGuards(JwtAuthGuard, UserOnlyGuard)
@Controller('app/v1/s3-bucket')
export class S3BucketController {
    constructor(private readonly i18n: I18nService) {}

    // ---------- S3 presigned upload URL ----------
    @ApiBearerAuth()
    @HttpCode(200)
    @Post('generate-upload-url')
    async generateUploadUrl(
        @Body() dto: GenerateUploadUrlDto,
        @Res() res: Response,
        @I18n() i18n: I18nContext
    ): Promise<ApiResponseType<S3UrlResponse | null>> {
        try {
            const data = await generateUploadURL(dto.file_path, dto.file_type);
            return successRes(res, i18n.t('GENERATE_UPLOAD_URL_SUCCESS'), data);
        } catch (error: unknown) {
            logError('GENERATE_UPLOAD_URL_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    // ---------- S3 presigned download URL ----------
    @ApiBearerAuth()
    @Get('generate-download-url')
    async generateDownloadUrl(
        @Query() dto: GenerateDownloadUrlDto,
        @Res() res: Response,
        @I18n() i18n: I18nContext
    ): Promise<ApiResponseType<S3DownloadResponse | null>> {
        try {
            const data = await generateDownloadURL(dto.file_path);
            return successRes(
                res,
                i18n.t('GENERATE_DOWNLOAD_URL_SUCCESS'),
                data
            );
        } catch (error: unknown) {
            logError('GENERATE_DOWNLOAD_URL_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    // ---------- Delete S3 file ----------
    @ApiBearerAuth()
    @Delete('delete-file')
    async deleteFile(
        @Query() dto: DeleteFileDto,
        @Res() res: Response,
        @I18n() i18n: I18nContext
    ): Promise<ApiResponseType<null>> {
        try {
            await deleteS3Object(dto.file_path);
            return successRes(res, i18n.t('DELETE_FILE_SUCCESS'), null);
        } catch (error: unknown) {
            logError('DELETE_FILE_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
