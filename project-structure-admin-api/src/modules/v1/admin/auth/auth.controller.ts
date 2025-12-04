import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    Req,
    HttpCode,
    Patch,
    Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    AdminSignUpDto,
    AdminSignInDto,
    AdminChangePasswordDto,
    AdminSendOtpForgotPasswordDto,
    AdminVerifyOtpDto,
    AdminResetPasswordDto,
    RefreshTokenDto,
} from './dto/auth.dto';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { translate } from '../../../../i18n/i18n.util';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../../../../common/guards/role.guard';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import authExampleResponse from './responses/auth.response';
import { logError } from '../../../../utils/logger';
import { AuthRequest } from '../../../../common/types';

@ApiTags('Admin Auth')
@Controller('admin/v1/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18n: I18nService
    ) {}

    @ApiResponse(authExampleResponse.ADMIN_SIGNUP_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('sign_up')
    async signUp(@Body() dto: AdminSignUpDto, @Res() res: Response) {
        try {
            const result = await this.authService.signUp(dto);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('SIGN_UP_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.ADMIN_SIGNIN_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 5, ttl: 60 } })
    @Post('sign_in')
    @HttpCode(200)
    async signIn(@Body() dto: AdminSignInDto, @Res() res: Response) {
        try {
            const result = await this.authService.signIn(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('SIGN_IN_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @Throttle({ default: { limit: 10, ttl: 60 } })
    @ApiResponse(authExampleResponse.TOKEN_REFRESHED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('refresh-token')
    async refreshToken(@Body() dto: RefreshTokenDto, @Res() res: Response) {
        try {
            const result = await this.authService.refreshToken(
                dto.refresh_token
            );
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, 'TOKEN_REFRESHED'),
                result.data
            );
        } catch (error: unknown) {
            logError('REFRESH_TOKEN_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AdminOnlyGuard)
    @ApiResponse(authExampleResponse.ADMIN_CHANGE_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Patch('change_password')
    async changePassword(
        @Body() dto: AdminChangePasswordDto,
        @Req() req: AuthRequest,
        @Res() res: Response
    ) {
        try {
            const { id } = req.user;

            const changePassword = await this.authService.changePassword(
                {
                    old_password: dto.old_password,
                    new_password: dto.new_password,
                },
                id
            );

            if (!changePassword.success) {
                return errorRes(
                    res,
                    translate(this.i18n, changePassword.message)
                );
            }

            return successRes(
                res,
                translate(this.i18n, changePassword.message),
                null
            );
        } catch (error: unknown) {
            logError('CHANGE_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @Throttle({ default: { limit: 3, ttl: 60 } })
    @ApiResponse(authExampleResponse.ADMIN_SEND_OTP_FORGOT_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('send_otp_forgot_password')
    @HttpCode(200)
    async sendOtpForgotPassword(
        @Body() dto: AdminSendOtpForgotPasswordDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.authService.sendOtpForgotPassword(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data
            );
        } catch (error: unknown) {
            logError('SEND_OTP_FORGOT_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.ADMIN_VERIFY_OTP_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 10, ttl: 60 } })
    @HttpCode(200)
    @Post('verify_otp')
    async verifyOtp(@Body() dto: AdminVerifyOtpDto, @Res() res: Response) {
        try {
            const result = await this.authService.verifyOtp(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(res, translate(this.i18n, result.message), null);
        } catch (error: unknown) {
            logError('VERIFY_OTP_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @Throttle({ default: { limit: 5, ttl: 60 } })
    @ApiResponse(authExampleResponse.ADMIN_RESET_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('reset_password')
    async resetPassword(
        @Body() dto: AdminResetPasswordDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.authService.resetPassword(dto);
            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(res, translate(this.i18n, result.message), null);
        } catch (error: unknown) {
            logError('RESET_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AdminOnlyGuard)
    @ApiResponse(authExampleResponse.ADMIN_LOGOUT_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: AuthRequest, @Res() res: Response) {
        try {
            const { id, token } = req.user;

            const logout = await this.authService.logout({
                id,
                token,
            });

            if (!logout.success) {
                return errorRes(res, translate(this.i18n, logout.message));
            }

            return successRes(res, translate(this.i18n, logout.message), null);
        } catch (error: unknown) {
            logError('LOGOUT_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AdminOnlyGuard)
    @ApiResponse(authExampleResponse.ADMIN_DASHBOARD_EXAMPLE)
    @HttpCode(200)
    @Get('dashboard')
    async dashboard(@Res() res: Response) {
        try {
            const data = await this.authService.dashboard();

            if (!data.success) {
                return errorRes(res, translate(this.i18n, data.message));
            }

            return successRes(
                res,
                translate(this.i18n, data.message),
                data.data
            );
        } catch (error: unknown) {
            logError('DASHBOARD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
