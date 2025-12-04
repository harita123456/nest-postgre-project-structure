import { Injectable } from '@nestjs/common';
import {
    SocialPlatform,
    CheckEmailAddressDto,
    UserSignUpDto,
    UserSignInDto,
    UserChangePasswordDto,
    UserSendOtpForgotPasswordDto,
    UserVerifyOtpDto,
    UserResetPasswordDto,
    SendVerificationEmailDto,
    VerifyEmailDto,
    CheckSocialMediaIdDto,
    CreateSessionDto,
    UpdateProfileDto,
    CheckUsernameDto,
} from './dto/auth.dto';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { users, User } from 'project-structure-database';
import { UserSession, userSessions } from 'project-structure-database';
import { emailVerifications } from 'project-structure-database';
import {
    securePassword,
    comparePassword,
} from '../../../../utils/secure_password.util';
import { userToken } from '../../../../utils/token.util';
import {
    hashTokenSha256,
    getRefreshExpiryDate,
    generateRefreshToken,
} from '../../../../utils/token.util';
import { ConfigService } from '@nestjs/config';
import {
    sendOtpForgotPasswordUser,
    sendVerificationEmailUser,
} from '../../../../utils/mailer.util';
import {
    ServiceResponse,
    serviceSuccess,
    serviceError,
    servicecatch,
} from '../../../../common/service-response';
import { logData, logError } from '../../../../utils/logger';
import { generateReferralCode } from '../../../../utils/refferal-code.utils';

interface UserInsertData {
    first_name?: string | null;
    last_name?: string | null;
    user_name?: string | null;
    email_address: string;
    is_social_login?: boolean;
    social_id?: string;
    social_platform?: SocialPlatform;
    password?: string;
    customer_id?: string | null;
    referral_code?: string | null;
}

interface AuthenticatedUser {
    id: number;
    token?: string | null;
    [key: string]: unknown;
}

interface EditProfileData {
    first_name?: string | null;
    last_name?: string | null;
    user_name?: string | null;
    profile_picture?: string | null;
}

export interface ReferralItem {
    id: number;
    referred_user_first_name: string | null;
    referred_user_last_name: string | null;
    referred_user_email: string | null;
    referred_user_profile_picture: string | null;
    referred_user_profile_url: string | null;
    earned_ammount?: number;
}

export interface ReferralData {
    referrals: ReferralItem[];
    total_earned_amount: number;
}

@Injectable()
export class AuthService {
    constructor(private readonly configService: ConfigService) {}

    // Generate a unique referral code that does not already exist in the DB
    private async generateUniqueReferralCode(): Promise<string | null> {
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
            const code = generateReferralCode();
            const [exists] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.referral_code, code),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);
            if (!exists) return code;
        }
        return null;
    }

    async getUserData(userId: number): Promise<ServiceResponse<User>> {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, userId), eq(users.is_deleted, false)))
                .limit(1);

            if (!user) {
                return serviceError('USER_NOT_FOUND');
            }
            return serviceSuccess('USER_FOUND', user);
        } catch (error: unknown) {
            logError('getUserData', error);
            return servicecatch('USER_GET_FAILED', error);
        }
    }

    async findUserByReferralCode(
        referral_code: string
    ): Promise<ServiceResponse<User>> {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.referral_code, referral_code),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!user) {
                return serviceError('REFFERED_USER_NOT_FOUND');
            }
            return serviceSuccess('USER_FOUND', user);
        } catch (error: unknown) {
            logError('findUserByReferralCode', error);
            return servicecatch('REFFERED_USER_GET_FAILED', error);
        }
    }

    async findUser(data: CheckEmailAddressDto): Promise<ServiceResponse<User>> {
        try {
            const { email_address } = data;

            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!user) {
                return serviceError('USER_NOT_FOUND');
            }
            return serviceSuccess('USER_FOUND', user);
        } catch (error: unknown) {
            logError('findUser', error);
            return servicecatch('USER_GET_FAILED', error);
        }
    }

    async findUserBySocialMediaIdService(
        data: CheckSocialMediaIdDto
    ): Promise<ServiceResponse<User>> {
        try {
            const { social_id, social_platform } = data;

            const [find_user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.is_social_login, true),
                        eq(users.social_id, social_id),
                        eq(users.social_platform, social_platform),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_user) {
                return serviceError('USER_NOT_FOUND');
            }
            return serviceSuccess('USER_FOUND', find_user);
        } catch (error: unknown) {
            logError('findUserBySocialMediaIdService', error);
            return servicecatch('USER_GET_FAILED', error);
        }
    }

    async checkEmailAddress(
        data: CheckEmailAddressDto
    ): Promise<ServiceResponse<null>> {
        try {
            const { email_address } = data;

            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (user) {
                return serviceError('EMAIL_ALREADY_EXISTS');
            }
            return serviceSuccess('EMAIL_AVAILABLE', null);
        } catch (error: unknown) {
            logError('checkEmailAddress', error);
            return servicecatch('EMAIL_CHECK_FAILED', error);
        }
    }

    async createUser(
        data: (UserSignUpDto | UserSignInDto) & { email_address: string }
    ): Promise<ServiceResponse<User>> {
        try {
            const {
                first_name,
                last_name,
                user_name,
                password,
                email_address,
                is_social_login,
                social_id,
                social_platform,
                device_token,
                device_type,
            } = data;

            if (user_name && user_name.trim().length > 0) {
                const userNameCheck = await this.checkUserNameAvailability({
                    username: user_name,
                });
                if (!userNameCheck.success) {
                    return serviceError('USER_NAME_ALREADY_EXISTS');
                }
            }

            const insert_data: UserInsertData = {
                first_name: first_name ? first_name : null,
                last_name: last_name ? last_name : null,
                user_name: user_name ? user_name : null,
                email_address: email_address,
                is_social_login: is_social_login,
            };

            if (is_social_login) {
                insert_data.social_id = social_id;
                insert_data.social_platform = social_platform;
            } else {
                if (password) {
                    const hashedPassword = securePassword(password);
                    insert_data.password = hashedPassword;
                }
            }

            const [create_user] = await db
                .insert(users)
                .values(insert_data)
                .returning();

            if (!create_user) {
                return serviceError('USER_CREATION_FAILED');
            }

            const token = userToken(create_user.id);
            const { token: refresh_token, expiresAt: refresh_expires_at } =
                generateRefreshToken();
            const refresh_token_hash = hashTokenSha256(refresh_token);

            const [session] = await db
                .insert(userSessions)
                .values({
                    device_token: device_token ?? null,
                    device_type: device_type,
                    auth_token: token,
                    user_id: create_user.id,
                    user_type: 'user',
                    is_login: true,
                    is_active: true,
                    refresh_token_hash,
                    refresh_expires_at,
                })
                .returning();

            if (!session) {
                return serviceError('SESSION_CREATION_FAILED');
            }

            const res_data = {
                ...create_user,
                token: token,
                refresh_token,
                device_token: session.device_token,
                device_type: session.device_type,
                user_profile: null,
            } as User;

            return serviceSuccess('USER_SIGNUP_SUCCESS', res_data);
        } catch (error: unknown) {
            logError('SIGNUP_SERVICE_ERROR', error);
            return serviceError('SIGNUP_SERVICE_ERROR');
        }
    }

    async editProfile(
        data: UpdateProfileDto,
        user_id: number
    ): Promise<ServiceResponse<User>> {
        try {
            const { first_name, last_name, user_name, profile_picture } = data;

            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, user_id))
                .limit(1);

            if (!user) {
                return serviceError('USER_NOT_FOUND');
            }

            // If nickname is changing, ensure uniqueness
            if (user_name && user_name !== user.user_name) {
                logData({ user_name, user_id });
                const userNameCheck =
                    await this.checkUserNameAvailabilityForUpdate({
                        username: user_name,
                        user_id,
                    });
                if (!userNameCheck.success) {
                    return serviceError('USER_NAME_ALREADY_EXISTS');
                }
            }

            const update_data: EditProfileData = {
                first_name: first_name ? first_name : user.first_name!,
                last_name: last_name ? last_name : user.last_name!,
                user_name: user_name ? user_name : user.user_name!,
                profile_picture: profile_picture
                    ? profile_picture
                    : user.profile_picture!,
            };
            logData({ update_data });

            const [update_user] = await db
                .update(users)
                .set(update_data)
                .where(eq(users.id, user_id))
                .returning();

            if (!update_user) {
                return serviceError('USER_UPDATE_FAILED');
            }

            return serviceSuccess('USER_UPDATED', update_user);
        } catch (error: unknown) {
            logError('editProfile', error);
            return servicecatch('USER_UPDATE_FAILED', error);
        }
    }

    async createSession(
        data: CreateSessionDto
    ): Promise<ServiceResponse<UserSession>> {
        try {
            const {
                device_token = null,
                device_type,
                auth_token,
                user_id,
            } = data;
            // // Runtime guards to avoid NOT NULL violations and ensure sane input
            // if (!device_token || device_token.trim().length === 0) {
            //     return serviceError('DEVICE_TOKEN_REQUIRED');
            // }
            if (!device_type) {
                return serviceError('DEVICE_TYPE_REQUIRED');
            }
            const refresh_token = data.refresh_token;
            const refresh_token_hash = refresh_token
                ? hashTokenSha256(refresh_token)
                : null;
            const refresh_expires_at = refresh_token
                ? getRefreshExpiryDate()
                : null;
            const [session] = await db
                .insert(userSessions)
                .values({
                    device_token: device_token ?? null,
                    device_type: device_type,
                    auth_token: auth_token,
                    user_id: user_id,
                    user_type: 'user',
                    is_login: true,
                    is_active: true,
                    ...(refresh_token_hash
                        ? {
                              refresh_token_hash,
                              refresh_expires_at,
                          }
                        : {}),
                })
                .onConflictDoUpdate({
                    target: [
                        userSessions.device_token,
                        userSessions.device_type,
                        userSessions.user_id,
                        userSessions.user_type,
                    ], // unique constraint / index should exist on these columns
                    set: {
                        auth_token,
                        is_login: true,
                        is_active: true,
                        updated_at: new Date(), // if you track updates
                        ...(refresh_token_hash
                            ? {
                                  refresh_token_hash,
                                  refresh_expires_at,
                              }
                            : {}),
                    },
                })
                .returning();

            if (!session) {
                return serviceError('SESSION_CREATION_FAILED');
            }

            return serviceSuccess('SESSION_CREATED', session);
        } catch (error: unknown) {
            logError('CREATE_SESSION_SERVICE_ERROR', error);
            return serviceError('CREATE_SESSION_SERVICE_ERROR');
        }
    }

    async refreshToken(refresh_token: string): Promise<
        ServiceResponse<{
            token: string;
            refresh_token: string;
        }>
    > {
        try {
            const refresh_token_hash = hashTokenSha256(refresh_token);

            const [session] = await db
                .select()
                .from(userSessions)
                .where(
                    and(
                        eq(userSessions.refresh_token_hash, refresh_token_hash),
                        eq(userSessions.is_deleted, false)
                    )
                )
                .limit(1);

            if (!session || !session.refresh_expires_at) {
                return serviceError('INVALID_REFRESH_TOKEN');
            }

            if (session.refresh_expires_at < new Date()) {
                return serviceError('REFRESH_TOKEN_EXPIRED');
            }

            // Verify user still exists and active
            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.id, session.user_id),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!user) {
                return serviceError('USER_NOT_FOUND');
            }

            const token = userToken(user.id);
            const { token: new_refresh_token, expiresAt } =
                generateRefreshToken();
            const new_refresh_hash = hashTokenSha256(new_refresh_token);

            const [updated] = await db
                .update(userSessions)
                .set({
                    auth_token: token,
                    refresh_token_hash: new_refresh_hash,
                    refresh_expires_at: expiresAt,
                    updated_at: new Date(),
                })
                .where(eq(userSessions.id, session.id))
                .returning();

            if (!updated) {
                return serviceError('REFRESH_FAILED');
            }

            return serviceSuccess('TOKEN_REFRESHED', {
                token,
                refresh_token: new_refresh_token,
            });
        } catch (error: unknown) {
            logError('REFRESH_TOKEN_SERVICE_ERROR', error);
            return serviceError('REFRESH_TOKEN_SERVICE_ERROR');
        }
    }

    async sendVerificationEmail(
        dto: SendVerificationEmailDto
    ): Promise<ServiceResponse<null>> {
        try {
            const { email_address } = dto;

            // If a user already exists with this email, don't send verification for signup
            const [existingUser] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (existingUser) {
                return serviceError('EMAIL_ALREADY_EXISTS');
            }

            // Generate 4-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            // const otp = 101010;
            const otpExpireAfterMin = Number(
                process.env.OTP_EXPIRE_AFTER_MIN || 10
            );
            const otp_expiry_time = new Date(
                Date.now() + otpExpireAfterMin * 60 * 1000
            );
            logData({ otpExpireAfterMin, now: new Date(), otp_expiry_time });

            // Upsert into email_verifications
            const [existingVerification] = await db
                .select()
                .from(emailVerifications)
                .where(eq(emailVerifications.email_address, email_address))
                .limit(1);

            if (existingVerification) {
                await db
                    .update(emailVerifications)
                    .set({
                        otp,
                        otp_expiry_time,
                        is_email_verified: false,
                        is_deleted: false,
                    })
                    .where(eq(emailVerifications.email_address, email_address));
            } else {
                await db.insert(emailVerifications).values({
                    email_address,
                    otp,
                    otp_expiry_time,
                    is_email_verified: false,
                    is_deleted: false,
                });
            }

            // Send email
            await sendVerificationEmailUser({
                emailAddress: email_address,
                otp,
            });

            return serviceSuccess('VERIFICATION_EMAIL_SENT', null);
        } catch (error: unknown) {
            logError('sendVerificationEmail', error);
            return servicecatch('VERIFICATION_EMAIL_SENT', error);
        }
    }

    async verifyEmail(
        dto: VerifyEmailDto
    ): Promise<ServiceResponse<{ is_verified: boolean }>> {
        try {
            const { email_address, otp } = dto;

            const [record] = await db
                .select()
                .from(emailVerifications)
                .where(
                    and(
                        eq(emailVerifications.email_address, email_address),
                        eq(emailVerifications.is_deleted, false)
                    )
                )
                .limit(1);

            if (!record) {
                return serviceError('EMAIL_VERIFICATION_NOT_FOUND');
            }

            if (record.otp !== null && record.otp === otp) {
                if (
                    record?.otp_expiry_time &&
                    record?.otp_expiry_time < new Date()
                ) {
                    return serviceError('OTP_EXPIRED');
                }

                await db
                    .update(emailVerifications)
                    .set({ is_email_verified: true, otp: 0 })
                    .where(eq(emailVerifications.email_address, email_address));

                return serviceSuccess('EMAIL_VERIFIED', { is_verified: true });
            }

            return serviceError('INVALID_VERIFICATION_CODE');
        } catch (error: unknown) {
            logError('verifyEmail', error);
            return servicecatch('EMAIL_VERIFICATION_FAILED', error);
        }
    }

    async checkEmailVerification(
        dto: CheckEmailAddressDto
    ): Promise<ServiceResponse<{ is_verified: boolean }>> {
        try {
            const { email_address } = dto;

            const [record] = await db
                .select()
                .from(emailVerifications)
                .where(
                    and(
                        eq(emailVerifications.email_address, email_address),
                        eq(emailVerifications.is_deleted, false),
                        eq(emailVerifications.is_email_verified, true)
                    )
                )
                .limit(1);

            if (!record) {
                return serviceError('EMAIL_VERIFICATION_NOT_FOUND');
            }

            return serviceSuccess('EMAIL_VERIFIED', { is_verified: true });
        } catch (error: unknown) {
            logError('checkEmailVerification', error);
            return servicecatch('checkEmailVerification', error);
        }
    }

    async changePassword(
        data: UserChangePasswordDto,
        user_id: number
    ): Promise<ServiceResponse<User>> {
        try {
            const { old_password, new_password } = data;

            const [find_user] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, user_id), eq(users.is_deleted, false)))
                .limit(1);

            if (!find_user) {
                return serviceError('USER_NOT_FOUND');
            }

            if (find_user.is_social_login === true) {
                return serviceError('SOCIAL_LOGIN_PASSWORD_CHANGE');
            }

            if (!find_user.password) {
                return serviceError('PASSWORD_NOT_SET');
            }

            const password_verify = comparePassword(
                old_password,
                find_user.password
            );

            if (!password_verify) {
                return serviceError('PASSWORD_INCORRECT');
            }

            // Prevent using the same password as the current one
            if (new_password === old_password) {
                return serviceError('NEW_PASSWORD_SAME_AS_OLD');
            }

            const hashedPassword = securePassword(new_password);

            const [update_user] = await db
                .update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, user_id))
                .returning();

            if (!update_user) {
                return serviceError('PASSWORD_CHANGED_FAILED');
            }

            return serviceSuccess('PASSWORD_CHANGED_SUCCESS');
        } catch (error: unknown) {
            logError('CHANGE_PASSWORD_SERVICE_ERROR', error);
            return servicecatch('CHANGE_PASSWORD_SERVICE_ERROR', error);
        }
    }

    async sendOtpForgotPassword(
        dto: UserSendOtpForgotPasswordDto
    ): Promise<ServiceResponse<null>> {
        try {
            const { email_address } = dto;

            const [find_user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (find_user?.is_social_login === true) {
                if (find_user?.social_platform === 'google') {
                    return serviceError('GOOGLE_LOGIN_PASSWORD_CHANGE');
                } else if (find_user?.social_platform === 'apple') {
                    return serviceError('APPLE_LOGIN_PASSWORD_CHANGE');
                } else {
                    return serviceError('SOCIAL_LOGIN_PASSWORD_CHANGE');
                }
            }

            if (!find_user) {
                return serviceError('USER_ACCOUNT_NOT_FOUND');
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            // const otp = 101010;
            const otpExpireAfterMin = Number(
                process.env.OTP_EXPIRE_AFTER_MIN || 10
            );
            const otp_expiry_time = new Date(
                Date.now() + otpExpireAfterMin * 60 * 1000
            );

            const fullName =
                find_user.first_name + ' ' + find_user.last_name ||
                email_address;

            const data = {
                otp,
                emailAddress: email_address,
                fullName: fullName,
            };

            await db
                .update(emailVerifications)
                .set({
                    otp,
                    otp_expiry_time,
                })
                .where(eq(emailVerifications.email_address, email_address));

            await sendOtpForgotPasswordUser(data);

            return serviceSuccess('OTP_SENT_SUCCESS', null);
        } catch (error: unknown) {
            logError('SEND_OTP_FORGOT_PASSWORD_SERVICE_ERROR', error);
            return servicecatch(
                'SEND_OTP_FORGOT_PASSWORD_SERVICE_ERROR',
                error
            );
        }
    }

    async verifyOtp(dto: UserVerifyOtpDto): Promise<ServiceResponse<null>> {
        try {
            const { email_address, otp } = dto;

            const [find_email_verification] = await db
                .select()
                .from(emailVerifications)
                .where(
                    and(
                        eq(emailVerifications.email_address, email_address),
                        eq(emailVerifications.is_email_verified, true),
                        eq(emailVerifications.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_email_verification) {
                return serviceError('USER_ACCOUNT_NOT_FOUND');
            }

            if (
                find_email_verification?.otp !== 0 &&
                find_email_verification?.otp === otp
            ) {
                if (
                    find_email_verification?.otp_expiry_time &&
                    find_email_verification?.otp_expiry_time < new Date()
                ) {
                    return serviceError('OTP_EXPIRED');
                }

                await db
                    .update(emailVerifications)
                    .set({
                        otp: 0,
                    })
                    .where(eq(emailVerifications.email_address, email_address));

                return serviceSuccess('OTP_VERIFIED', null);
            } else {
                return serviceError('OTP_INCORRECT');
            }
        } catch (error: unknown) {
            logError('VERIFY_OTP_SERVICE_ERROR', error);
            return servicecatch('VERIFY_OTP_SERVICE_ERROR', error);
        }
    }

    async resetPassword(
        dto: UserResetPasswordDto
    ): Promise<ServiceResponse<null>> {
        try {
            const { email_address, password } = dto;

            const [find_user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_user) {
                throw new Error('USER_ACCOUNT_NOT_FOUND');
            }

            const hashedPassword = securePassword(password);

            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(
                    and(eq(users.id, find_user.id), eq(users.is_deleted, false))
                );

            return serviceSuccess('PASSWORD_RESET_SUCCESS', null);
        } catch (error: unknown) {
            logError('RESET_PASSWORD_SERVICE_ERROR', error);
            return servicecatch('RESET_PASSWORD_SERVICE_ERROR', error);
        }
    }

    async logout(user: AuthenticatedUser): Promise<ServiceResponse<null>> {
        try {
            const { id, token } = user;

            const [find_user] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, id), eq(users.is_deleted, false)))
                .limit(1);

            if (!find_user) {
                return serviceError('USER_NOT_FOUND');
            }

            await db
                .delete(userSessions)
                .where(
                    and(
                        eq(userSessions.user_id, id),
                        eq(userSessions.auth_token, token!)
                    )
                );

            return serviceSuccess('LOGOUT_SUCCESS');
        } catch (error: unknown) {
            logError('LOGOUT_SERVICE_ERROR', error);
            return servicecatch('LOGOUT_SERVICE_ERROR', error);
        }
    }

    async deleteAccount(
        user: AuthenticatedUser
    ): Promise<ServiceResponse<null>> {
        try {
            const { id } = user;

            const [find_user] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, id), eq(users.is_deleted, false)))
                .limit(1);

            if (!find_user) {
                return serviceError('USER_NOT_FOUND');
            }

            await db
                .update(users)
                .set({ is_deleted: true })
                .where(and(eq(users.id, find_user.id)));

            await db
                .delete(userSessions)
                .where(and(eq(userSessions.user_id, id)));

            return serviceSuccess('ACCOUNT_DELETED_SUCCESS', null);
        } catch (error: unknown) {
            logError('DELETE_ACCOUNT_SERVICE_ERROR', error);
            return servicecatch('DELETE_ACCOUNT_SERVICE_ERROR', error);
        }
    }

    async checkUserNameAvailability(
        dto: CheckUsernameDto
    ): Promise<ServiceResponse<{ is_available: boolean }>> {
        try {
            const { username } = dto;

            const [record] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.user_name, username),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (record) {
                return serviceError('USERNAME_NOT_AVAILABLE');
            }

            return serviceSuccess('USERNAME_AVAILABLE', { is_available: true });
        } catch (error: unknown) {
            logError('CHECK_USERNAME_SERVICE_ERROR', error);
            return servicecatch('CHECK_USERNAME_SERVICE_ERROR', error);
        }
    }

    async checkUserNameAvailabilityForUpdate(
        dto: CheckUsernameDto
    ): Promise<ServiceResponse<{ is_available: boolean }>> {
        try {
            const { username, user_id } = dto;

            const [record] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.user_name, username),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (record && record.id !== user_id) {
                return serviceError('USERNAME_NOT_AVAILABLE');
            }

            return serviceSuccess('USERNAME_AVAILABLE', { is_available: true });
        } catch (error: unknown) {
            logError('CHECK_USERNAME_SERVICE_ERROR', error);
            return servicecatch('CHECK_USERNAME_SERVICE_ERROR', error);
        }
    }
}
