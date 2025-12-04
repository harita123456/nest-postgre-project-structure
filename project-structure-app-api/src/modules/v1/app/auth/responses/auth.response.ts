const authExampleResponse = {
    CHECK_EMAIL_ADDRESS_EXAMPLE: {
        status: 200,
        description: 'Check email address responses',
        content: {
            'application/json': {
                examples: {
                    Exists: {
                        summary: 'Email already exists',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Email address already exists.',
                        },
                    },
                    Available: {
                        summary: 'Email available',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Email address available.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    GET_USER_DATA_EXAMPLE: {
        status: 200,
        description: 'Get user data responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Success',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User Data fetched successfully.',
                            data: {
                                id: 2,
                                user_type: 'user',
                                first_name: 'John',
                                last_name: 'Doe',
                                email_address: 'user@yopmail.com',
                                password:
                                    '$2b$12$5B/wBUvfuTab6U8qdBVoievlpVhhGJrcSJPkd/L.z5YXplfntNbkC',
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
                            },
                        },
                    },
                    Failed: {
                        summary: 'Failed',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Failed to fetch user data.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    SEND_VERIFICATION_EMAIL_EXAMPLE: {
        status: 200,
        description: 'Send verification email responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Success',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Verification email sent successfully.',
                            data: null,
                        },
                    },
                    Failed: {
                        summary: 'Failed',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Failed to send verification email.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    VERIFY_EMAIL_ADDRESS_EXAMPLE: {
        status: 200,
        description: 'Verify email address responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Success',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Email verified successfully.',
                            data: {
                                is_verified: true,
                            },
                        },
                    },
                    Failed: {
                        summary: 'Failed',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Failed to verify email address.',
                            data: null,
                        },
                    },
                    InvalidVerificationCode: {
                        summary: 'Invalid verification code',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Invalid verification code.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    SIGN_UP_EXAMPLE: {
        status: 200,
        description: 'User signup responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Success',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User signed up successfully.',
                            data: {
                                id: 2,
                                user_type: 'user',
                                first_name: 'John',
                                last_name: 'Doe',
                                email_address: 'user@yopmail.com',
                                password:
                                    '$2b$12$5B/wBUvfuTab6U8qdBVoievlpVhhGJrcSJPkd/L.z5YXplfntNbkC',
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
                                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU5MTI3MTU3LCJleHAiOjE3NTkyMTM1NTcsImF1ZCI6Im5lc3Qtc2VydmVyLXVzZXJzIiwiaXNzIjoibmVzdC1zZXJ2ZXItYXBwIn0.uFZjO5WtRyBqsBjiIk-5uLJy2MRjNHTQHki5KHPpVGU',
                                refresh_token:
                                    '686dd79182c760646f7cc3270625e3fada2ea9528c9b92a4b413d5983dec32dab13161ec90d697166b689e6b425007a8',
                                device_token: 'device_token_1',
                                device_type: 'ios',
                                user_profile: null,
                            },
                        },
                    },
                    Failed: {
                        summary: 'Failed',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Failed to sign up.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    SIGN_IN_EXAMPLE: {
        status: 200,
        description: 'User sign in responses',
        content: {
            'application/json': {
                examples: {
                    EmailUsed: {
                        summary: 'Email already used by you',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'This email has already been used by you. Kindly sign in using {platform}.',
                        },
                    },
                    PasswordIncorrect: {
                        summary: 'Password incorrect',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The password you entered is incorrect. Please try again.',
                        },
                    },
                    UserBlocked: {
                        summary: 'User blocked',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'This account has been blocked. Please get in touch with the administrator.',
                        },
                    },
                    Success: {
                        summary: 'Success',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Signed in successfully.',
                            data: {
                                id: 2,
                                user_type: 'user',
                                first_name: 'John',
                                last_name: 'Doe',
                                email_address: 'user@yopmail.com',
                                password:
                                    '$2b$12$5B/wBUvfuTab6U8qdBVoievlpVhhGJrcSJPkd/L.z5YXplfntNbkC',
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
                                token: 'token',
                                refresh_token: 'refresh_token',
                            },
                        },
                    },
                },
            },
        },
    },

    CHANGE_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Change password responses',
        content: {
            'application/json': {
                examples: {
                    OldPasswordIncorrect: {
                        summary: 'Old password incorrect',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The old password you entered is incorrect. Please try again.',
                        },
                    },
                    NewPasswordTooSimilar: {
                        summary: 'New password too similar',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'The new password is too similar to the old password. Please choose a different one.',
                        },
                    },
                    Success: {
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

    SEND_OTP_FORGOT_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Send OTP forgot password responses',
        content: {
            'application/json': {
                examples: {
                    EmailNotFound: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    OtpSent: {
                        summary: 'OTP sent successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'An OTP has been successfully sent to your email.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    VERIFY_OTP_EXAMPLE: {
        status: 200,
        description: 'Verify OTP responses',
        content: {
            'application/json': {
                examples: {
                    EmailNotFound: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    InvalidOtp: {
                        summary: 'Invalid OTP',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Please enter a valid OTP.',
                        },
                    },
                    Success: {
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

    RESET_PASSWORD_EXAMPLE: {
        status: 200,
        description: 'Reset password responses',
        content: {
            'application/json': {
                examples: {
                    EmailNotFound: {
                        summary: 'Email not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message:
                                'No account associated with this email address was found.',
                        },
                    },
                    Success: {
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

    LOGOUT_EXAMPLE: {
        status: 200,
        description: 'Logout responses',
        content: {
            'application/json': {
                examples: {
                    UserNotFound: {
                        summary: 'User not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'User not found.',
                        },
                    },
                    Success: {
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

    DELETE_ACCOUNT_EXAMPLE: {
        status: 200,
        description: 'Delete account responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Delete account successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Your account has been deleted.',
                            data: null,
                        },
                    },
                    UserNotFound: {
                        summary: 'User not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'User not found.',
                        },
                    },
                },
            },
        },
    },

    CHECK_USERNAME_AVAILABILITY_EXAMPLE: {
        status: 200,
        description: 'Check user name availability responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'User name available',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User name available.',
                            data: null,
                        },
                    },
                    UserNameNotAvailable: {
                        summary: 'User name not available',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'User name not available.',
                        },
                    },
                    UserNotFound: {
                        summary: 'User not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'User not found.',
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

    REFERRAL_LIST_EXAMPLE: {
        status: 200,
        description: 'Get referral list',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Get referral list successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User referral list get successfully.',
                            data: {
                                total_referrals_count: 14,
                                total_referral_amount: 0,
                                data: [
                                    {
                                        id: 3,
                                        referred_user_first_name: 'tesy',
                                        referred_user_last_name: 'tesy',
                                        referred_user_email: 'test11@gmail.com',
                                        referred_user_profile_picture: null,
                                        referred_user_profile_url: null,
                                        earned_ammount: 0,
                                    },
                                    {
                                        id: 2,
                                        referred_user_first_name: 'tesy',
                                        referred_user_last_name: 'tesy',
                                        referred_user_email:
                                            'testdevice.weapplinse@gmail.com',
                                        referred_user_profile_picture: null,
                                        referred_user_profile_url: null,
                                        earned_ammount: 0,
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    },
} as const;

export default authExampleResponse;
