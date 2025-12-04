import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    Req,
    Patch,
    Delete,
    Get,
    Query,
    HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';
import { AuthService } from './auth.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
    CheckEmailAddressDto,
    UserSignUpDto,
    UserSignInDto,
    UserChangePasswordDto,
    UserSendOtpForgotPasswordDto,
    UserVerifyOtpDto,
    UserResetPasswordDto,
    SendVerificationEmailDto,
    VerifyEmailDto,
    UpdateProfileDto,
    CheckUsernameDto,
} from './dto/auth.dto';
import { User } from 'project-structure-database';
import { translate } from '../../../../i18n/i18n.util';
import authExampleResponse from './responses/auth.response';
import { AuthRequest } from '../../../../common/types';
import { comparePassword } from '../../../../utils/secure_password.util';
import { userToken } from '../../../../utils/token.util';
import { logError } from '../../../../utils/logger';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';
import { generateRefreshToken } from '../../../../utils/token.util';
import { RefreshTokenDto } from './dto/auth.dto';

@ApiTags('App Auth')
@Controller('app/v1/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18n: I18nService
    ) {}

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiResponse(authExampleResponse.TOKEN_REFRESHED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('refresh-token')
    async refreshToken(
        @Body() dto: RefreshTokenDto,
        @Res() res: Response
    ): Promise<ApiResponseType<{ token: string } | null>> {
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

    @ApiResponse(authExampleResponse.CHECK_EMAIL_ADDRESS_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('check-email-address')
    async checkEmailAddress(
        @Query() data: CheckEmailAddressDto,
        @Res() res: Response
    ): Promise<ApiResponseType<{ is_available: boolean } | null>> {
        try {
            const result = await this.authService.checkEmailAddress(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('CHECK_EMAIL_ADDRESS_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.CHECK_EMAIL_ADDRESS_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Get('check-username')
    async checkUserNameAvailability(
        @Query() data: CheckUsernameDto,
        @Res() res: Response
    ): Promise<ApiResponseType<{ is_available: boolean } | null>> {
        try {
            const result =
                await this.authService.checkUserNameAvailability(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('CHECK_USERNAME_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @Throttle({ default: { limit: 7, ttl: 60000 } })
    @ApiResponse(authExampleResponse.SEND_VERIFICATION_EMAIL_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('send-verification-email')
    async sendVerificationEmail(
        @Body() data: SendVerificationEmailDto,
        @Res() res: Response
    ): Promise<ApiResponseType<null>> {
        try {
            const result = await this.authService.sendVerificationEmail(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('SEND_VERIFICATION_EMAIL_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiResponse(authExampleResponse.VERIFY_EMAIL_ADDRESS_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('verify-email')
    async verifyEmail(
        @Body() data: VerifyEmailDto,
        @Res() res: Response
    ): Promise<ApiResponseType<{ is_verified: boolean } | null>> {
        try {
            const result = await this.authService.verifyEmail(data);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }

            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('VERIFY_EMAIL_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.SIGN_UP_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(200)
    @Post('sign-up')
    async signUp(
        @Body() data: UserSignUpDto,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const findEmail = await this.authService.checkEmailAddress({
                email_address: data.email_address,
            });

            if (!findEmail.success) {
                return errorRes(res, translate(this.i18n, findEmail.message));
            }

            const checkEmailVerification =
                await this.authService.checkEmailVerification({
                    email_address: data.email_address,
                });

            if (!checkEmailVerification.success) {
                return errorRes(
                    res,
                    translate(this.i18n, checkEmailVerification.message)
                );
            }

            const result = await this.authService.createUser(data);

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

    @ApiResponse(authExampleResponse.SIGN_IN_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(200)
    @Post('sign-in')
    async signIn(
        @Body() data: UserSignInDto,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            if (data.is_social_login === true) {
                const findSocialUser =
                    await this.authService.findUserBySocialMediaIdService({
                        social_id: data.social_id!,
                        social_platform: data.social_platform!,
                    });

                if (findSocialUser.success) {
                    if (findSocialUser.data?.is_blocked_by_admin) {
                        return errorRes(
                            res,
                            translate(this.i18n, 'USER_BLOCKED')
                        );
                    }

                    const user = findSocialUser.data as User;

                    const token = userToken(user.id);
                    const { token: refresh_token } = generateRefreshToken();

                    const sessioData = {
                        user_id: user.id,
                        auth_token: token,
                        device_token: data.device_token,
                        device_type: data.device_type,
                        refresh_token,
                    };

                    const createUserSession =
                        await this.authService.createSession(sessioData);

                    if (!createUserSession.success) {
                        return errorRes(
                            res,
                            translate(this.i18n, createUserSession.message)
                        );
                    }

                    const responseData = {
                        ...user,
                        token: token,
                        refresh_token,
                    };

                    return successRes(
                        res,
                        translate(this.i18n, 'SIGN_IN_SUCCESS'),
                        responseData
                    );
                } else {
                    if (!data.email_address) {
                        return errorRes(
                            res,
                            translate(this.i18n, 'EMAIL_ADDRESS_REQUIRED')
                        );
                    } else {
                        const findUser = await this.authService.findUser({
                            email_address: data.email_address,
                        });

                        if (findUser.success) {
                            if (
                                (findUser.data as User).is_social_login === true
                            ) {
                                if (
                                    (findUser.data as User)?.social_platform ===
                                    'apple'
                                ) {
                                    return errorRes(
                                        res,
                                        translate(
                                            this.i18n,
                                            'PLEASE_LOG_IN_WITH_APPLE'
                                        )
                                    );
                                } else {
                                    return errorRes(
                                        res,
                                        translate(
                                            this.i18n,
                                            'PLEASE_LOG_IN_WITH_GOOGLE'
                                        )
                                    );
                                }
                            } else {
                                return errorRes(
                                    res,
                                    translate(
                                        this.i18n,
                                        'PLEASE_LOG_IN_WITH_EMAIL_AND_PASSWORD'
                                    )
                                );
                            }
                        } else {
                            if (!data.email_address) {
                                return errorRes(
                                    res,
                                    translate(
                                        this.i18n,
                                        'EMAIL_ADDRESS_REQUIRED'
                                    )
                                );
                            }

                            // We have already ensured data.email_address is defined above
                            const result = await this.authService.createUser(
                                data as UserSignUpDto & {
                                    email_address: string;
                                }
                            );

                            if (!result.success) {
                                return errorRes(
                                    res,
                                    translate(this.i18n, result.message)
                                );
                            }

                            return successRes(
                                res,
                                translate(this.i18n, result.message),
                                result.data
                            );
                        }
                    }
                }
            } else {
                const findUser = await this.authService.findUser({
                    email_address: data.email_address!,
                });

                if (!findUser.success) {
                    return errorRes(
                        res,
                        translate(this.i18n, findUser.message)
                    );
                }

                if (findUser.data?.is_blocked_by_admin) {
                    return errorRes(res, translate(this.i18n, 'USER_BLOCKED'));
                }

                const user = findUser.data as User;

                if (data.password && user.password) {
                    const verifyPassword = comparePassword(
                        data.password,
                        user.password
                    );

                    if (!verifyPassword) {
                        return errorRes(
                            res,
                            translate(this.i18n, 'INVALID_PASSWORD')
                        );
                    }

                    const token = userToken(user.id);
                    const { token: refresh_token } = generateRefreshToken();

                    const sessioData = {
                        user_id: user.id,
                        auth_token: token,
                        device_token: data.device_token,
                        device_type: data.device_type,
                        refresh_token,
                    };

                    const createUserSession =
                        await this.authService.createSession(sessioData);

                    if (!createUserSession.success) {
                        return errorRes(
                            res,
                            translate(this.i18n, createUserSession.message)
                        );
                    }

                    const responseData = {
                        ...user,
                        token: token,
                        refresh_token,
                    };

                    return successRes(
                        res,
                        translate(this.i18n, 'SIGN_IN_SUCCESS'),
                        responseData
                    );
                } else {
                    return errorRes(
                        res,
                        translate(this.i18n, 'INVALID_PASSWORD')
                    );
                }
            }
        } catch (error: unknown) {
            logError('SIGN_IN_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @ApiResponse(authExampleResponse.GET_USER_DATA_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Get('me')
    async getUserData(
        @Req() req: AuthRequest,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const result = await this.authService.getUserData(req.user.id);

            if (!result.success) {
                return errorRes(res, translate(this.i18n, result.message));
            }
            return successRes(
                res,
                translate(this.i18n, result.message),
                result.data ?? null
            );
        } catch (error: unknown) {
            logError('GET_USER_DATA_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @ApiResponse(authExampleResponse.CHANGE_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.UNAUTHORIZED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Patch('edit-profile')
    async editProfile(
        @Req() req: AuthRequest,
        @Res() res: Response,
        @Body() data: UpdateProfileDto
    ): Promise<ApiResponseType<User | null>> {
        try {
            const { id } = req.user;

            const editProfile = await this.authService.editProfile(
                {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    profile_picture: data.profile_picture,
                    user_name: data.user_name,
                },
                id
            );

            if (!editProfile.success) {
                return errorRes(res, translate(this.i18n, editProfile.message));
            }

            return successRes(
                res,
                translate(this.i18n, editProfile.message),
                editProfile.data
            );
        } catch (error: unknown) {
            logError('CHANGE_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @ApiResponse(authExampleResponse.CHANGE_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.UNAUTHORIZED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Patch('change-password')
    async changePassword(
        @Req() req: AuthRequest,
        @Res() res: Response,
        @Body() data: UserChangePasswordDto
    ): Promise<ApiResponseType<User | null>> {
        try {
            const { id } = req.user;

            const changePassword = await this.authService.changePassword(
                {
                    old_password: data.old_password,
                    new_password: data.new_password,
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

    @ApiResponse(authExampleResponse.SEND_OTP_FORGOT_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(200)
    @Post('forgot-password')
    async sendOtpForgotPassword(
        @Body() data: UserSendOtpForgotPasswordDto,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const forgotPassword =
                await this.authService.sendOtpForgotPassword(data);

            if (!forgotPassword.success) {
                return errorRes(
                    res,
                    translate(this.i18n, forgotPassword.message)
                );
            }

            return successRes(
                res,
                translate(this.i18n, forgotPassword.message),
                forgotPassword.data
            );
        } catch (error: unknown) {
            logError('SEND_OTP_FORGOT_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.VERIFY_OTP_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(200)
    @Post('verify-otp')
    async verifyOtp(
        @Body() data: UserVerifyOtpDto,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const verifyOtp = await this.authService.verifyOtp(data);

            if (!verifyOtp.success) {
                return errorRes(res, translate(this.i18n, verifyOtp.message));
            }

            return successRes(
                res,
                translate(this.i18n, verifyOtp.message),
                verifyOtp.data
            );
        } catch (error: unknown) {
            logError('VERIFY_OTP_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiResponse(authExampleResponse.RESET_PASSWORD_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('reset-password')
    async resetPassword(
        @Body() dto: UserResetPasswordDto,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const resetPassword = await this.authService.resetPassword(dto);

            if (!resetPassword.success) {
                return errorRes(
                    res,
                    translate(this.i18n, resetPassword.message)
                );
            }

            return successRes(
                res,
                translate(this.i18n, resetPassword.message),
                resetPassword.data
            );
        } catch (error: unknown) {
            logError('RESET_PASSWORD_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @ApiResponse(authExampleResponse.LOGOUT_EXAMPLE)
    @ApiResponse(authExampleResponse.UNAUTHORIZED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @HttpCode(200)
    @Post('logout')
    async logout(
        @Req() req: AuthRequest,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const { id, token } = req.user;

            const response = await this.authService.logout({
                id,
                token,
            });

            if (!response.success) {
                return errorRes(res, translate(this.i18n, response.message));
            }

            return successRes(
                res,
                translate(this.i18n, response.message),
                response.data
            );
        } catch (error: unknown) {
            logError('LOGOUT_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @ApiResponse(authExampleResponse.DELETE_ACCOUNT_EXAMPLE)
    @ApiResponse(authExampleResponse.UNAUTHORIZED_EXAMPLE)
    @ApiResponse(authExampleResponse.VALIDATION_ERROR_EXAMPLE)
    @Delete('delete-account')
    async deleteAccount(
        @Req() req: AuthRequest,
        @Res() res: Response
    ): Promise<ApiResponseType<User | null>> {
        try {
            const { id, token } = req.user;

            const response = await this.authService.deleteAccount({
                id,
                token,
                password: req.user.password ?? undefined,
            });

            if (!response.success) {
                return errorRes(res, translate(this.i18n, response.message));
            }

            return successRes(
                res,
                translate(this.i18n, response.message),
                response.data
            );
        } catch (error: unknown) {
            logError('DELETE_ACCOUNT_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
