import { Injectable } from '@nestjs/common';
import { db } from '../../../../database/connection';
import { v4 as uuidv4 } from 'uuid';
import {
    users,
    User,
    userSessions,
    emailVerifications,
} from 'project-structure-database';
import {
    securePassword,
    comparePassword,
} from '../../../../utils/secure_password.util';
import {
    AdminSignUpDto,
    AdminSignInDto,
    AdminChangePasswordDto,
    AdminSendOtpForgotPasswordDto,
    AdminVerifyOtpDto,
    AdminResetPasswordDto,
} from './dto/auth.dto';
import {
    generateRefreshToken,
    hashTokenSha256,
    userToken,
} from '../../../../utils/token.util';
import { sendOtpForgotPasswordAdmin } from '../../../../utils/mailer.util';
import { eq, and } from 'drizzle-orm';
import {
    ServiceResponse,
    serviceError,
    servicecatch,
    serviceSuccess,
} from '../../../../common/service-response';
import { logError } from '../../../../utils/logger';

interface AuthenticatedUser {
    id: number;
    token: string;
}

@Injectable()
export class AuthService {
    constructor() {}

    async signUp(dto: AdminSignUpDto): Promise<ServiceResponse<User | null>> {
        try {
            const {
                first_name,
                last_name,
                email_address,
                password,
                device_type,
            } = dto;

            const hashedPassword = password
                ? securePassword(password)
                : undefined;

            const [createdAdmin] = await db
                .insert(users)
                .values({
                    first_name: first_name,
                    last_name: last_name,
                    email_address: email_address,
                    password: hashedPassword,
                    user_type: 'admin',
                })
                .returning();

            if (!createdAdmin) {
                return serviceError('FAILED_TO_CREATE_ADMIN_USER');
            }

            const userData = createdAdmin;
            userData.password = null;

            const token = userToken(userData.id);
            const { token: refresh_token, expiresAt } = generateRefreshToken();
            const refresh_hash = hashTokenSha256(refresh_token);
            const temporary_device_token = uuidv4();

            await db.insert(userSessions).values({
                device_token: temporary_device_token,
                device_type: device_type,
                auth_token: token,
                user_id: userData.id,
                user_type: 'admin',
                is_login: true,
                refresh_token_hash: refresh_hash,
                refresh_expires_at: expiresAt,
            });

            const response_data = {
                ...userData,
                token,
                refresh_token,
            };

            return serviceSuccess('ADMIN_CREATED', response_data);
        } catch (error) {
            logError('signUp', error);
            return servicecatch('signUp', error);
        }
    }

    async signIn(
        dto: AdminSignInDto
    ): Promise<ServiceResponse<(User & { token: string }) | null>> {
        try {
            const { email_address, password, device_type } = dto;

            const [find_admin] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.user_type, 'admin'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_admin) {
                return serviceError('ADMIN_ACCOUNT_NOT_FOUND');
            }

            const password_verify = comparePassword(
                password,
                String(find_admin.password)
            );

            if (!password_verify) {
                return serviceError('PASSWORD_INCORRECT');
            }

            const token = userToken((find_admin as User).id);
            const { token: refresh_token, expiresAt } = generateRefreshToken();
            const refresh_hash = hashTokenSha256(refresh_token);
            const temporary_device_token = uuidv4();

            // Upsert session to fix unique constraint error for same device
            await db
                .insert(userSessions)
                .values({
                    device_token: temporary_device_token,
                    device_type: device_type,
                    auth_token: token,
                    user_id: (find_admin as User).id,
                    user_type: 'admin',
                    is_login: true,
                    refresh_token_hash: refresh_hash,
                    refresh_expires_at: expiresAt,
                })
                .onConflictDoUpdate({
                    target: [
                        userSessions.user_id,
                        userSessions.user_type,
                        userSessions.device_token,
                        userSessions.device_type,
                    ],
                    set: {
                        auth_token: token,
                        refresh_token_hash: refresh_hash,
                        refresh_expires_at: expiresAt,
                        is_login: true,
                        updated_at: new Date(),
                    },
                });

            find_admin.password = null;

            const response_data = {
                ...find_admin,
                token,
                refresh_token,
            };

            return serviceSuccess('ADMIN_SIGNED_IN', response_data);
        } catch (error) {
            logError('signIn', error);
            return servicecatch('signIn', error);
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

    async changePassword(
        data: AdminChangePasswordDto,
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

            const password_verify = comparePassword(
                old_password,
                find_user.password!
            );

            if (!password_verify) {
                return serviceError('PASSWORD_INCORRECT');
            }

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
        dto: AdminSendOtpForgotPasswordDto
    ): Promise<ServiceResponse<boolean>> {
        try {
            const { email_address } = dto;

            const [find_admin] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.user_type, 'admin'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_admin) {
                return serviceError('ADMIN_ACCOUNT_NOT_FOUND');
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpireAfterMin = Number(
                process.env.OTP_EXPIRE_AFTER_MIN || 10
            );
            const otp_expiry_time = new Date(
                Date.now() + otpExpireAfterMin * 60 * 1000
            );

            const data = {
                otp,
                emailAddress: email_address,
            };

            await sendOtpForgotPasswordAdmin(data);

            const result = await db
                .update(emailVerifications)
                .set({ otp: otp, otp_expiry_time })
                .where(
                    and(
                        eq(emailVerifications.email_address, email_address),
                        eq(emailVerifications.is_email_verified, true),
                        eq(emailVerifications.is_deleted, false)
                    )
                )
                .returning();

            if (!result || result.length === 0) {
                await db.insert(emailVerifications).values({
                    email_address,
                    otp,
                    otp_expiry_time,
                    is_email_verified: true,
                    is_deleted: false,
                });
            }

            return serviceSuccess('OTP_SENT', null);
        } catch (error) {
            logError('sendOtpForgotPassword', error);
            return servicecatch('sendOtpForgotPassword', error);
        }
    }

    async verifyOtp(dto: AdminVerifyOtpDto): Promise<ServiceResponse<boolean>> {
        try {
            const { email_address, otp } = dto;

            const [find_admin] = await db
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

            if (!find_admin) {
                return serviceError('ADMIN_ACCOUNT_NOT_FOUND');
            }

            if (find_admin?.otp !== 0 && find_admin?.otp === otp) {
                if (
                    find_admin?.otp_expiry_time &&
                    find_admin?.otp_expiry_time < new Date()
                ) {
                    return serviceError('OTP_EXPIRED');
                }

                await db
                    .update(emailVerifications)
                    .set({ otp: 0 })
                    .where(
                        and(
                            eq(emailVerifications.email_address, email_address),
                            eq(emailVerifications.is_email_verified, true),
                            eq(emailVerifications.is_deleted, false)
                        )
                    );

                return serviceSuccess('OTP_VERIFIED', true);
            } else {
                return serviceError('OTP_INCORRECT');
            }
        } catch (error) {
            logError('verifyOtp', error);
            return servicecatch('verifyOtp', error);
        }
    }

    async resetPassword(
        dto: AdminResetPasswordDto
    ): Promise<ServiceResponse<boolean>> {
        try {
            const { email_address, password } = dto;

            const [find_admin] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email_address, email_address),
                        eq(users.user_type, 'admin'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!find_admin) {
                return serviceError('ADMIN_ACCOUNT_NOT_FOUND');
            }

            const hashedPassword = securePassword(password);

            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(
                    and(
                        eq(users.id, find_admin.id),
                        eq(users.user_type, 'admin'),
                        eq(users.email_address, email_address),
                        eq(users.is_deleted, false)
                    )
                );

            return serviceSuccess('PASSWORD_RESET', true);
        } catch (error) {
            logError('resetPassword', error);
            return servicecatch('resetPassword', error);
        }
    }

    async logout(user: AuthenticatedUser): Promise<ServiceResponse<boolean>> {
        try {
            const { id, token } = user;

            const [find_admin] = await db
                .select()
                .from(users)
                .where(and(eq(users.id, id), eq(users.is_deleted, false)))
                .limit(1);

            if (!find_admin) {
                return serviceError('ADMIN_NOT_FOUND');
            }

            await db
                .delete(userSessions)
                .where(
                    and(
                        eq(userSessions.user_id, id),
                        eq(userSessions.auth_token, token)
                    )
                );

            return serviceSuccess('LOGOUT', true);
        } catch (error) {
            logError('logout', error);
            return servicecatch('logout', error);
        }
    }

    async dashboard(): Promise<ServiceResponse<{ [key: string]: number }>> {
        try {
            const adminDashboard = {
                users: 0,
            };

            const [find_user_count] = await Promise.all([
                db.$count(
                    users,
                    and(
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                ),
            ]);

            const res_data = {
                ...adminDashboard,
                users: find_user_count,
            };

            return serviceSuccess('DASHBOARD', res_data);
        } catch (error) {
            logError('dashboard', error);
            return servicecatch('dashboard', error);
        }
    }
}
