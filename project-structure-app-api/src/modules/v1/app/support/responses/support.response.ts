const supportExampleResponse = {
    CREATE_SUPPORT_EXAMPLE: {
        status: 200,
        description: 'Create support ticket responses',
        content: {
            'application/json': {
                examples: {
                    SUCCESS: {
                        summary: 'Support ticket created successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The support ticket has been successfully created.',
                            data: {
                                id: 10,
                                user_id: 1,
                                subject: 'Issue with user creation',
                                message:
                                    'I encountered an error when trying to create a user.',
                                attachment_url:
                                    'https://cdn.yourapp.com/uploads/screenshot.png',
                                is_resolved: false,
                                is_deleted: false,
                                created_at: '2025-10-06T08:30:00.000Z',
                                updated_at: '2025-10-06T08:30:00.000Z',
                            },
                        },
                    },
                },
            },
        },
    },

    GET_MY_SUPPORTS_EXAMPLE: {
        status: 200,
        description: 'Get my support tickets responses',
        content: {
            'application/json': {
                examples: {
                    NOT_FOUND: {
                        summary: 'No support tickets found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'Support tickets not found.',
                        },
                    },
                    SUCCESS: {
                        summary: 'Support tickets retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'Support tickets list.',
                            data: [
                                {
                                    id: 10,
                                    user_id: 1,
                                    subject: 'Issue with user creation',
                                    message:
                                        'I encountered an error when trying to create a user.',
                                    attachment_url:
                                        'https://cdn.yourapp.com/uploads/screenshot.png',
                                    is_resolved: false,
                                    is_deleted: false,
                                    created_at: '2025-10-06T08:30:00.000Z',
                                    updated_at: '2025-10-06T08:30:00.000Z',
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
                            path: '/v1/app/support',
                        },
                    },
                },
            },
        },
    },
} as const;

export default supportExampleResponse;
