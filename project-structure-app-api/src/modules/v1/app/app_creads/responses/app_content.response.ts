const appCreadsExampleResponse = {
    GET_APP_CREAD_EXAMPLE: {
        status: 200,
        description: 'Get app creads responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'App creads not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The app creads not found.',
                        },
                    },
                    SUCCESS: {
                        summary: 'App creads retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The app creads has been successfully retrieved.',
                            data: {
                                id: 2,
                                app_key: 'app_key',
                                app_secret: 'app_secret',
                                environment: 'local',
                                is_deleted: false,
                                created_at: '2025-10-01T06:49:25.896Z',
                                updated_at: '2025-10-01T06:49:25.896Z',
                            },
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

    INTERNAL_SERVER_ERROR_EXAMPLE: {
        status: 500,
        description: 'Internal server error',
        content: {
            'application/json': {
                examples: {
                    InternalServerError: {
                        summary: 'Internal server error',
                        value: {
                            success: false,
                            statuscode: 500,
                            message:
                                'An unexpected error occurred on the server. Please try again later.',
                            path: '/v1/app/auth',
                        },
                    },
                },
            },
        },
    },

    ADD_APP_CREAD_EXAMPLE: {
        status: 200,
        description: 'Add app creads responses',
        content: {
            'application/json': {
                examples: {
                    SUCCESS: {
                        summary: 'App creads added successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The app creads has been successfully added.',
                            data: {
                                id: 2,
                                app_key: 'app_key',
                                app_secret: 'app_secret',
                                environment: 'environment',
                                is_deleted: false,
                                created_at: '2025-10-01T06:49:25.896Z',
                                updated_at: '2025-10-01T06:49:25.896Z',
                            },
                        },
                    },
                },
            },
        },
    },

    UPDATE_APP_CREAD_EXAMPLE: {
        status: 200,
        description: 'Update app creads responses',
        content: {
            'application/json': {
                examples: {
                    SUCCESS: {
                        summary: 'App creads updated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The app creads has been successfully updated.',
                            data: {
                                id: 2,
                                app_key: 'app_key',
                                app_secret: 'app_secret',
                                environment: 'environment',
                                is_deleted: false,
                                created_at: '2025-10-01T06:49:25.896Z',
                                updated_at: '2025-10-01T06:49:25.896Z',
                            },
                        },
                    },
                },
            },
        },
    },

    DELETE_APP_CREAD_EXAMPLE: {
        status: 200,
        description: 'Delete app creads responses',
        content: {
            'application/json': {
                examples: {
                    SUCCESS: {
                        summary: 'App creads deleted successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The app creads has been successfully deleted.',
                            data: null,
                        },
                    },
                },
            },
        },
    },
} as const;

export default appCreadsExampleResponse;
