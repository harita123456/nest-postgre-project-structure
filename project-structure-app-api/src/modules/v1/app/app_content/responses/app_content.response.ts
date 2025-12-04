const appContentExampleResponse = {
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
                                content_type: 'terms_and_condition',
                                content:
                                    'https://dojowell.com/en/Privacy_Policy',
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
                                    content_type: 'terms_and_condition',
                                    content:
                                        'https://dojowell.com/en/Privacy_Policy',
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
