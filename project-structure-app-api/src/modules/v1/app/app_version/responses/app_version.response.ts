const appVersionExampleResponse = {
    ADD_APP_VERSION_EXAMPLE: {
        status: 200,
        description: 'Add app version responses',
        content: {
            'application/json': {
                examples: {
                    First: {
                        summary: 'App version added successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The app version has been successfully created.',
                            data: {
                                id: 133,
                                app_version: '1.1',
                                is_maintenance: false,
                                app_update_status: 'is_force_update',
                                app_platform: 'ios',
                                app_url:
                                    'https://play.google.com/store/apps/details?id=com.example',
                                api_base_url: 'https://api.example.com',
                                is_live: true,
                                is_deleted: false,
                                created_at: '2025-09-29T07:05:07.648Z',
                                updated_at: '2025-09-29T07:05:07.648Z',
                            },
                        },
                    },
                    Failed: {
                        summary: 'App version not already exists',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'App version already exists.',
                            data: null,
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
                            timestamp: new Date().toISOString(),
                            path: '/v1/app/app-version',
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
                            timestamp: new Date().toISOString(),
                            path: '/v1/app/app-version',
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
                                'app_platform must be a string, app_version must be a string',
                            timestamp: new Date().toISOString(),
                            path: '/v1/app/app-version',
                        },
                    },
                },
            },
        },
    },
    APP_VERSION_CHECK_EXAMPLE: {
        status: 200,
        description: 'App version checked responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'App version checked successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'App version checked successfully.',
                            data: {
                                is_need_update: false,
                                is_force_update: false,
                                is_maintenance: false,
                            },
                        },
                    },
                    OptionalUpdate: {
                        summary: 'Optional update available',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'App version checked successfully.',
                            data: {
                                is_need_update: true,
                                is_force_update: false,
                                is_maintenance: false,
                            },
                        },
                    },
                    ForceUpdate: {
                        summary: 'Force update required',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'App version checked successfully.',
                            data: {
                                is_need_update: true,
                                is_force_update: true,
                                is_maintenance: false,
                            },
                        },
                    },
                    Maintenance: {
                        summary: 'Maintenance mode',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'App version checked successfully.',
                            data: {
                                is_need_update: false,
                                is_force_update: false,
                                is_maintenance: true,
                            },
                        },
                    },
                },
            },
        },
    },
    NOT_FOUND_EXAMPLE: {
        status: 404,
        description: 'Not found',
        content: {
            'application/json': {
                examples: {
                    NotFound: {
                        summary: 'App version not found',
                        value: {
                            success: false,
                            statuscode: 404,
                            message: 'App version not found.',
                            timestamp: new Date().toISOString(),
                            path: '/v1/app/app-version',
                        },
                    },
                },
            },
        },
    },
    UPDATE_APP_VERSION_EXAMPLE: {
        status: 200,
        description: 'Update app version responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'App version updated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'App version updated successfully.',
                            data: {},
                        },
                    },
                },
            },
        },
    },
};

export default appVersionExampleResponse;
