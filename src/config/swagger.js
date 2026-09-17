import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'SRJJ AMS API',
            version: '1.0.0',
            description: 'API documentation for the SRJJ Accounting Management System.'
        },

        servers: [
            {
                url: env.apiUrl || 'http://localhost:5000',
                description: env.nodeEnv === 'production' ? 'Production Server' : env.nodeEnv === 'staging' ? 'Staging Server' : 'Development Server'
            }
        ],

        tags: [
            {
                name: 'System',
                description: 'System and health endpoints'
            },

            {
                name: 'Authentication',
                description: 'Authentication endpoints'
            },

            {
                name: 'Password',
                description: 'Password management endpoints'
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },

            schemas: {
                RegisterRequest: {
                    type: 'object',

                    required: ['email', 'password', 'first_name', 'last_name'],

                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@example.com'
                        },

                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'Password@123'
                        },

                        first_name: {
                            type: 'string',
                            example: 'Juan'
                        },

                        middle_name: {
                            type: 'string',
                            nullable: true
                        },

                        last_name: {
                            type: 'string',
                            example: 'Dela Cruz'
                        },

                        ext_name: {
                            type: 'string',
                            nullable: true
                        }
                    }
                },


                LoginRequest: {
                    type: 'object',

                    required: ['email', 'password'],

                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@example.com'
                        },

                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'Password@123'
                        }
                    }
                },


                VerifyOtpRequest: {
                    type: 'object',

                    required: ['challenge_id', 'otp'],

                    properties: {
                        challenge_id: {
                            type: 'string',
                            format: 'uuid'
                        },

                        otp: {
                            type: 'string',
                            example: '123456'
                        }
                    }
                },


                OtpChallengeRequest: {
                    type: 'object',

                    required: ['challenge_id'],

                    properties: {
                        challenge_id: {
                            type: 'string',
                            format: 'uuid'
                        }
                    }
                },


                ForgotPasswordRequest: {
                    type: 'object',

                    required: ['email'],

                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@example.com'
                        }
                    }
                },


                ResetPasswordRequest: {
                    type: 'object',

                    required: ['token', 'password', 'password_confirmation'],

                    properties: {
                        token: {
                            type: 'string'
                        },

                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'NewPassword@123'
                        },

                        password_confirmation: {
                            type: 'string',
                            format: 'password',
                            example: 'NewPassword@123'
                        }
                    }
                },


                ChangePasswordRequest: {
                    type: 'object',

                    required: ['current_password', 'password', 'password_confirmation'],

                    properties: {
                        current_password: {
                            type: 'string',
                            format: 'password'
                        },

                        password: {
                            type: 'string',
                            format: 'password'
                        },

                        password_confirmation: {
                            type: 'string',
                            format: 'password'
                        }
                    }
                },


                RefreshTokenRequest: {
                    type: 'object',

                    required: ['refresh_token'],

                    properties: {
                        refresh_token: {
                            type: 'string'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',

                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },

                        message: {
                            type: 'string'
                        },

                        code: {
                            type: 'string'
                        }
                    }
                },

                LoginRequest: {
                    type: 'object',

                    required: ['email', 'password'],

                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example:
                                'admin@example.com'
                        },

                        password: {
                            type: 'string',
                            format: 'password',
                            example:
                                'Password@123'
                        }
                    }
                },

                VerifyOtpRequest: {
                    type: 'object',

                    required: ['challenge_id', 'otp'],

                    properties: {
                        challenge_id: {
                            type: 'string',
                            format: 'uuid'
                        },

                        otp: {
                            type: 'string',
                            example: '123456'
                        }
                    }
                },

                ForgotPasswordRequest: {
                    type: 'object',

                    required: ['email'],

                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example:
                                'admin@example.com'
                        }
                    }
                },

                ResetPasswordRequest: {
                    type: 'object',

                    required: ['token', 'password', 'password_confirmation'],

                    properties: {
                        token: {
                            type: 'string'
                        },

                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'NewPassword@123'
                        },

                        password_confirmation: {
                            type: 'string',
                            format: 'password',
                            example: 'NewPassword@123'
                        }
                    }
                },

                ChangePasswordRequest: {
                    type: 'object',

                    required: ['current_password', 'password', 'password_confirmation'],

                    properties: {
                        current_password: {
                            type: 'string',
                            format: 'password'
                        },

                        password: {
                            type: 'string',
                            format: 'password'
                        },

                        password_confirmation: {
                            type: 'string',
                            format: 'password'
                        }
                    }
                },

                RefreshTokenRequest: {
                    type: 'object',

                    required: ['refresh_token'],

                    properties: {
                        refresh_token: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    },

    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;