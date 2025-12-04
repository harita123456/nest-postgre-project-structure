const faqExampleResponse = {
    ADD_FAQ_EXAMPLE: {
        status: 200,
        description: 'Add FAQ responses',
        content: {
            'application/json': {
                examples: {
                    Exists: {
                        summary: 'FAQ already exists',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The FAQ already exists.',
                        },
                    },
                    Success: {
                        summary: 'FAQ added successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'The FAQ has been successfully created.',
                            data: {},
                        },
                    },
                },
            },
        },
    },

    EDIT_FAQ_EXAMPLE: {
        status: 200,
        description: 'Edit FAQ responses',
        content: {
            'application/json': {
                examples: {
                    Not_found: {
                        summary: 'FAQ not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The FAQ was not found.',
                        },
                    },
                    Success: {
                        summary: 'FAQ updated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'The FAQ has been successfully updated.',
                            data: {},
                        },
                    },
                },
            },
        },
    },

    DELETE_FAQ_EXAMPLE: {
        status: 200,
        description: 'Delete FAQ responses',
        content: {
            'application/json': {
                examples: {
                    Not_found: {
                        summary: 'FAQ not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The FAQ was not found.',
                        },
                    },
                    Success: {
                        summary: 'FAQ deleted successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'The FAQ has been successfully deleted.',
                            data: null,
                        },
                    },
                },
            },
        },
    },

    LIST_FAQ_EXAMPLE: {
        status: 200,
        description: 'List FAQ responses',
        content: {
            'application/json': {
                examples: {
                    Success: {
                        summary: 'FAQ list retrieved successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The FAQ list has been successfully retrieved.',
                            total_number_of_data: 0,
                            data: [],
                        },
                    },
                },
            },
        },
    },

    ACTIVE_DEACTIVE_FAQ_EXAMPLE: {
        status: 200,
        description: 'Activate/Deactivate FAQ responses',
        content: {
            'application/json': {
                examples: {
                    Not_found: {
                        summary: 'FAQ not found',
                        value: {
                            success: false,
                            statuscode: 0,
                            message: 'The FAQ was not found.',
                        },
                    },
                    Activate: {
                        summary: 'FAQ activated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message: 'The FAQ has been successfully activated.',
                            data: {},
                        },
                    },
                    Deactivate: {
                        summary: 'FAQ deactivated successfully',
                        value: {
                            success: true,
                            statuscode: 1,
                            message:
                                'The FAQ has been successfully deactivated.',
                            data: {},
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

export default faqExampleResponse;
