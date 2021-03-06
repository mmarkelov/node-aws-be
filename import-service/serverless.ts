import type {Serverless} from 'serverless/aws';

const serverlessConfiguration: Serverless = {
    service: 'import-service',
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true
        }
    },
    // Add the serverless-webpack plugin
    plugins: ['serverless-webpack'],
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        region: 'eu-west-1',
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            BUCKET: 'node-aws-files',
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            CATALOG_SQS_QUEUE_URL: '${cf:product-service-${self:provider.stage}.SQSQueueUrl}'
        },
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: 's3:ListBucket',
                Resource: 'arn:aws:s3:::${self:provider.environment.BUCKET}'
            },
            {
                Effect: 'Allow',
                Action: 's3:*',
                Resource: 'arn:aws:s3:::${self:provider.environment.BUCKET}/*'
            },
            {
                Effect: 'Allow',
                Action: 'sqs:*',
                Resource: [
                    '${cf:product-service-${self:provider.stage}.SQSQueueArn}'
                ]
            }
        ],
    },
    functions: {
        importProductsFile: {
            handler: 'handler.importProductsFile',
            events: [
                {
                    http: {
                        method: 'get',
                        path: '/',
                        request: {
                            parameters: {
                                querystrings: {
                                    name: true
                                }
                            }
                        },
                        cors: true,
                        authorizer: {
                            name: 'basicAuthorizer',
                            arn: '${cf:authorization-service-${self:provider.stage}.BasicAuthorizerLambdaFunctionQualifiedArn}',
                            resultTtlInSeconds: 0,
                            identitySource: 'method.request.header.Authorization',
                            type: 'token'
                        }
                    }
                }
            ]
        },
        importFileParser: {
            handler: 'handler.importFileParser',
            events: [
                {
                    s3: {
                        bucket: '${self:provider.environment.BUCKET}',
                        event: 's3:ObjectCreated:*',
                        rules: [
                            {
                                prefix: 'uploaded/',
                                suffix: ''
                            }
                        ],
                        existing: true
                    }
                }
            ]
        }
    },
    resources: {
        Resources: {
            GatewayResponseDefault4XX: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS'"
                    },
                    ResponseType: 'DEFAULT_4XX',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    }
                }
            }
        }
    }
}

module.exports = serverlessConfiguration;
