import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    Get,
    Param,
    ParseIntPipe,
    HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../../../../common/guards/role.guard';
import { UsersService } from './users.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
    multiSuccessRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { translate } from '../../../../i18n/i18n.util';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { blockUnblockUserDto, ListUsersDto } from './dto/users.dto';
import { logError } from '../../../../utils/logger';
import usersExampleResponse from './responses/users.response';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@ApiTags('Users')
@Controller('admin/v1/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(usersExampleResponse.USERS_LIST_EXAMPLE)
    @ApiResponse(usersExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('list')
    async list(@Body() dto: ListUsersDto, @Res() res: Response) {
        try {
            const result = await this.usersService.listUsers(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return multiSuccessRes(
                res,
                translate(this.i18n, result.message),
                result.total ?? 0,
                result.data ?? []
            );
        } catch (error: unknown) {
            logError('USERS_LIST_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(usersExampleResponse.USER_DETAILS_EXAMPLE)
    @ApiResponse(usersExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('details/:id')
    async details(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        try {
            const result = await this.usersService.userDetails(id);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('USER_DETAILS_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(usersExampleResponse.BLOCK_USER_EXAMPLE)
    @ApiResponse(usersExampleResponse.UNBLOCK_USER_EXAMPLE)
    @ApiResponse(usersExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('block-unblock-user')
    async block(@Body() dto: blockUnblockUserDto, @Res() res: Response) {
        try {
            const result = await this.usersService.blockUnblockUser(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(res, translate(this.i18n, result.message), null);
        } catch (error: unknown) {
            logError('USER_BLOCK_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
