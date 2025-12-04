const authExampleResponse = {
    ADMIN_SIGNUP_EXAMPLE: {
        status: 200,
        description: 'Admin signup responses',
        content: {
            'application/json': {
                examples: {
                    EXISTS: {
                        summary: 'Email already exists',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'This email address is already registered. Please use a different email or log in to your existing account.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Admin created successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Admin account created successfully.',
                            data: {
                                id: 2,
                                user_type: 'admin',
                                first_name: 'John',
                                last_name: 'Doe',
                                email_address: 'user@yopmail.com',
                                password: 'password',
                                profile_url: 'profile_url',
                                profile_picture: 'profile_picture',
                                is_social_login: false,
                                social_id: null,
                                social_platform: null,
                                customer_id: null,
                                is_user_verified: false,
                                is_blocked_by_admin: false,
                                is_deleted: false,
                                created_at: '2025-09-29T06:25:57.063Z',
                                updated_at: '2025-09-29T06:25:57.063Z',
                                token: 'auth_token',
                                refresh_token: 'refresh_token',
                                device_token: 'device_token_1',
                                device_type: 'ios',
                                user_profile: null,
                            },
                        },
                    },
                    FAILED: {
                        summary: 'Failed to create admin user',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'Failed to create admin user. Please try again later.',
                        },
                    },
                },
            },
        },
    },

    ADMIN_SIGNIN_EXAMPLE: {
        status: 200,
        description: 'Admin sign in responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account found associated with this email address.',
                        },
                    },
                    PASSWORD_INCORRECT: {
                        summary: 'Password incorrect',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The password you entered is incorrect. Please try again.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Admin logged in successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Admin logged in successfully.',
                            data: {
                                id: 2,
                                user_type: 'admin',
                                first_name: 'John',
                                last_name: 'Doe',
                                email_address: 'user@yopmail.com',
                                password: 'password',
                                profile_url: 'profile_url',
                                profile_picture: 'profile_picture',
                                is_social_login: false,
                                social_id: null,
                                social_platform: null,
                                customer_id: null,
                                is_user_verified: false,
                                is_blocked_by_admin: false,
                                is_deleted: false,
                                created_at: '2025-09-29T06:25:57.063Z',
                                updated_at: '2025-09-29T06:25:57.063Z',
                                token: 'auth_token',
                                refresh_token: 'refresh_token',
                                device_token: 'device_token_1',
                                device_type: 'ios',
                                user_profile: null,
                            },
                        },
                    },
                },
            },
        },
    },

    ADMIN_CHANGE_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Change password responses',
        content: {
            'application/json': {
                examples: {
                    OLD_PASSWORD_INCORRECT: {
                        summary: 'Old password incorrect',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The old password you entered is incorrect. Please try again.',
                        },
                    },
                    NEW_PASSWORD_TOO_SIMILAR: {
                        summary: 'New password too similar',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The new password is too similar to the old password. Please choose a different one.',
                        },
                    },
                    PASSWORD_CHANGED_SUCCESSFULLY: {
                        summary: 'Password changed successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'Your password has been successfully changed.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    ADMIN_SEND_OTP_FORGOT_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Send OTP forgot password responses',
        content: {
            'application/json': {
                examples: {
                    EMAIL_NOT_FOUND: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    OTP_SENT_SUCCESSFULLY: {
                        summary: 'OTP sent successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'An OTP has been successfully sent to your email.',
                            data: 7707,
                        },
                    },
                },
            },
        },
    },

    ADMIN_VERIFY_OTP_EXAMPLE: {
        status: 200,
        description: 'Verify OTP responses',
        content: {
            'application/json': {
                examples: {
                    EMAIL_NOT_FOUND: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    INVALID_OTP: {
                        summary: 'Invalid OTP',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Please enter a valid OTP.',
                        },
                    },
                    OTP_VERIFIED_SUCCESSFULLY: {
                        summary: 'OTP verified successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'OTP verified successfully.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    ADMIN_RESET_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Reset password responses',
        content: {
            'application/json': {
                examples: {
                    EMAIL_NOT_FOUND: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    PASSWORD_RESET_SUCCESSFULLY: {
                        summary: 'Password reset successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'Your password has been successfully reset.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    ADMIN_LOGOUT_EXAMPLE: {
        status: 200,
        description: 'Logout responses',
        content: {
            'application/json': {
                examples: {
                    ADMIN_NOT_FOUND: {
                        summary: 'Admin not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Admin not found.',
                        },
                    },
                    LOGOUT_SUCCESSFULLY: {
                        summary: 'Logout successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'You have successfully logged out.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    ADMIN_DASHBOARD_EXAMPLE: {
        status: 200,
        description: 'Dashboard responses',
        content: {
            'application/json': {
                examples: {
                    DATA_LOADED_SUCCESSFULLY: {
                        summary: 'Data loaded successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Data has been successfully loaded.',
                            data: {
                                users: 0,
                            },
                        },
                    },
                },
            },
        },
    },

    UNAUTHORIZED_EXAMPLE: {
        status: 401,
        description: 'Unauthorized',
        content: {
            'application/json': {
                examples: {
                    Unauthorized: {
                        summary: 'JWT missing or invalid',
                        value: {
                            success: false,
                            statuscode: 401,
                            message: 'Unauthorized',
                            path: '/v1/app/auth',
                        },
                    },
                },
            },
        },
    },

    FORBIDDEN_EXAMPLE: {
        status: 403,
        description: 'Forbidden',
        content: {
            'application/json': {
                examples: {
                    Forbidden: {
                        summary: 'User role not allowed',
                        value: {
                            success: false,
                            statuscode: 403,
                            message: 'Forbidden',
                            path: '/v1/app/auth',
                        },
                    },
                },
            },
        },
    },

    VALIDATION_ERROR_EXAMPLE: {
        status: 400,
        description: 'Validation error',
        content: {
            'application/json': {
                examples: {
                    ValidationError: {
                        summary: 'DTO validation failed',
                        value: {
                            success: false,
                            statuscode: 400,
                            message:
                                'One or more fields failed validation. Please check your input.',
                            path: '/v1/app/auth',
                        },
                    },
                },
            },
        },
    },

    TOKEN_REFRESHED_EXAMPLE: {
        status: 200,
        description: 'Token refreshed successfully',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Token refreshed successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Token refreshed successfully.',
                            data: {
                                token: 'token',
                                refresh_token: 'refresh_token',
                            },
                        },
                    },
                    Failed: {
                        summary: 'Invalid refresh token',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Invalid refresh token.',
                            data: null,
                        },
                    },
                },
            },
        },
    },
} as const;

export default authExampleResponse;
