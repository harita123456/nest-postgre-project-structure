const usersExampleResponse = {
    USERS_LIST_EXAMPLE: {
        status: 200,
        description: 'Users list responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'Users list retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Users list fetched successfully.',
                            total_number_of_data: 2,
                            data: [
                                {
                                    id: 'id',
                                    first_name: 'first_name',
                                    last_name: 'last_name',
                                    email_address: 'email_address',
                                    mobile_number: 'mobile_number',
                                    user_type: 'user_type',
                                    created_at: 'created_at',
                                    is_blocked_by_admin: 'is_blocked_by_admin',
                                    updated_at: 'updated_at',
                                },
                                {
                                    id: 'id',
                                    first_name: 'first_name',
                                    last_name: 'last_name',
                                    email_address: 'email_address',
                                    mobile_number: 'mobile_number',
                                    user_type: 'user_type',
                                    created_at: 'created_at',
                                    is_blocked_by_admin: 'is_blocked_by_admin',
                                    updated_at: 'updated_at',
                                },
                            ],
                        },
                    },
                },
            },
        },
    },

    USER_DETAILS_EXAMPLE: {
        status: 200,
        description: 'User details responses',
        content: {
            'application/json': {
                examples: {
                    Not_found: {
                        summary: 'User not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'User not found.',
                        },
                    },
                    Success: {
                        summary: 'User details fetched successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User details fetched successfully.',
                            data: {
                                id: 101,
                                user_type: 'user',
                                first_name: 'Alex Brown',
                                last_name: 'Alex Brown',
                                email_address: 'exampleemail@gmail.com',
                                password: null,
                                profile_url: null,
                                profile_picture: null,
                                is_social_login: false,
                                social_id: null,
                                social_platform: null,
                                customer_id: null,
                                is_user_verified: true,
                                is_blocked_by_admin: false,
                                is_deleted: false,
                                created_at: '2025-09-01T00:00:00.000Z',
                                updated_at: '2025-09-01T00:00:00.000Z',
                            },
                        },
                    },
                },
            },
        },
    },

    BLOCK_USER_EXAMPLE: {
        status: 200,
        description: 'User blocked successfully',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'User blocked successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User blocked successfully.',
                        },
                    },
                },
            },
        },
    },

    UNBLOCK_USER_EXAMPLE: {
        status: 200,
        description: 'User unblocked successfully',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'User unblocked successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'User unblocked successfully.',
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
                            path: '/admin/v1/users',
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
                            path: '/admin/v1/users',
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
                            path: '/admin/v1/users',
                        },
                    },
                },
            },
        },
    },
} as const;

export default usersExampleResponse;
