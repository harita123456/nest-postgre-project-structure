const appContentExampleResponse = {
    ADD_CONTENT_EXAMPLE: {
        status: 200,
        description: 'Add content responses',
        content: {
            'application/json': {
                examples: {
                    Exists: {
                        summary: 'Content already exists',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The content already exists.',
                        },
                    },
                    Success: {
                        summary: 'Content added successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The content has been successfully created.',
                            data: {
                                id: 1,
                                content_type: 'content_type',
                                content: 'content',
                                is_deleted: false,
                                created_at: '2025-10-01T09:00:50.450Z',
                                updated_at: '2025-10-01T09:00:50.450Z',
                            },
                        },
                    },
                },
            },
        },
    },

    EDIT_CONTENT_EXAMPLE: {
        status: 200,
        description: 'Edit content responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'Content not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The content not found.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Content updated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The content has been successfully updated.',
                            data: {
                                id: 1,
                                content_type: 'content_type',
                                content: 'content',
                                is_deleted: false,
                                created_at: '2025-10-01T09:00:50.450Z',
                                updated_at: '2025-10-01T09:00:50.450Z',
                            },
                        },
                    },
                    FAILED: {
                        summary: 'Content update failed',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The content update failed.',
                        },
                    },
                },
            },
        },
    },

    DELETE_CONTENT_EXAMPLE: {
        status: 200,
        description: 'Delete content responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'Content not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The content not found.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Content deleted successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The content has been successfully deleted.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    GET_CONTENT_EXAMPLE: {
        status: 200,
        description: 'GET content responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'Content not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The content not found.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Content retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The content has been successfully retrieved.',
                            data: {
                                id: 1,
                                content_type: 'content_type',
                                content: 'content',
                                is_deleted: false,
                                created_at: '2025-10-01T09:00:50.450Z',
                                updated_at: '2025-10-01T09:00:50.450Z',
                            },
                        },
                    },
                },
            },
        },
    },

    GET_ALL_CONTENT_EXAMPLE: {
        status: 200,
        description: 'Get all content responses',
        content: {
            'application/json': {
                examples: {
                    SUCCESS: {
                        summary: 'Contents retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The content has been successfully retrieved.',
                            data: [
                                {
                                    id: 1,
                                    content_type: 'content_type',
                                    content: 'content',
                                    is_deleted: false,
                                    created_at: '2025-10-01T09:00:50.450Z',
                                    updated_at: '2025-10-01T09:00:50.450Z',
                                },
                            ],
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
} as const;

export default appContentExampleResponse;
