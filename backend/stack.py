from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_dynamodb as dynamo,
    aws_secretsmanager as secretsmanager,
    aws_iam as iam,
    RemovalPolicy   ,
    CfnOutput
)
from constructs import Construct
from aws_cdk import Duration


def generate_name(name,env,type):
    return f"flycalcio-{name}-{env}-{type}"


class MyApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, env='dev', **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        
        # Create one shared execution role
        shared_lambda_role = iam.Role(
            self, generate_name('lambdarole','dev','table'),
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )

        
        # JWT secret in Secrets Manager
        jwt_secret = secretsmanager.Secret(
            self,
            "JwtSecretKey",
            secret_name=generate_name('jwtkey','dev','secret'),
            description="JWT signing key for development",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_punctuation=True,
                include_space=False,
                password_length=32
            )
        )
        jwt_refresh_secret = secretsmanager.Secret(
            self,
            "JwtRefreshSecretKey",
            secret_name=generate_name('jwt-refresh-key','dev','secret'),
            description="JWT Refresh signing key for development",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                exclude_punctuation=True,
                include_space=False,
                password_length=64
            )
        )
        
        # The code `app_table` is not valid Python syntax. It seems like it is meant to be a
        # placeholder or a comment in the code.
        app_table = dynamo.Table(
            self,
            f"FinalyzeAppTable-{env}",
            table_name=generate_name("app", env, "table"),
            partition_key=dynamo.Attribute(
                name="PK",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="SK",
                type=dynamo.AttributeType.STRING
            ),
            billing_mode=dynamo.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # GSI for listing users / events
        app_table.add_global_secondary_index(
            index_name="GSI1",
            partition_key=dynamo.Attribute(
                name="GSI1PK",
                type=dynamo.AttributeType.STRING
            ),
            sort_key=dynamo.Attribute(
                name="GSI1SK",
                type=dynamo.AttributeType.STRING
            ),
            projection_type=dynamo.ProjectionType.ALL
        )
        
       
        
            
    

            
        # Grant read access to secrets
        for secret in [jwt_secret,jwt_refresh_secret]:
            secret.grant_read(shared_lambda_role)
        
        
        # ---- Global environment dict ----
        global_env = {
            "JWT_SECRET_NAME": jwt_secret.secret_arn,
            "REFRESH_SECRET_NAME":jwt_refresh_secret.secret_arn,
            "ENVIRONMENT": "dev",
            "FRONTEND_BASE_URL":"https://localhost:3000/",
            "JWT_EXPIRATION":"3600",
            "ACCESS_TOKEN_EXPIRATION":"3600",
            "APP_NAME":"FlyCalcioGuestApp",
            "JWT_SECRET_NAME":"finalyze-jwtkey-dev-secret",
            "JWT_REFRESH_SECRET_NAME":"finalyze-jwt-refresh-key-dev-secret",
            "ACCESS_TOKEN_EXPIRATION":"600",
            "REFRESH_TOKEN_EXPIRATION":"86400",
            "DEFAULT_CORS_ORIGIN":"https://finalyze.alessiogiovannini.com",
            'DB_TABLE_NAME': app_table.table_name
            
        }
        

        
        utils_layer = _lambda.LayerVersion(
            self, "UtilsLayer",
            code=_lambda.Code.from_asset("layer"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_12],
            description="Shared utils"
        )
        
        common_layer = _lambda.LayerVersion(
            self, "CommonLayer",
            code=_lambda.Code.from_asset("src/common"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_12],
            description="Shared Functions"
        )
        # Lambda functions ---
        authorizer_lambda = _lambda.Function(
            self, generate_name('authorizer', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.authorizer",
            code=_lambda.Code.from_asset("src/authorizer"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer]
        )
        
   

        auth_lambda = _lambda.Function(
            self, generate_name('auth', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/auth"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            timeout=Duration.seconds(90),
            memory_size=1024
        )

        public_lambda = _lambda.Function(
            self, generate_name('public', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/public"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer]
        )

        private_lambda = _lambda.Function(
            self, generate_name('private', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/private"),
            environment=global_env,
            role=shared_lambda_role,
            timeout= Duration.seconds(30),
            layers=[utils_layer,common_layer],
            memory_size=2048
            
        )
        
        events_lambda = _lambda.Function(
            self, generate_name('actuals', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/events"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
        )
        
        guests_lambda = _lambda.Function(
            self, generate_name('category', 'dev', 'lambda'),
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("src/guests"),
            environment=global_env,
            role=shared_lambda_role,
            layers=[utils_layer,common_layer],
            memory_size=1024
        )
      


        # --- Create the API Gateway ---
        api = apigw.RestApi(
            self,
            generate_name('restapi', 'dev', 'apigateway'),
            rest_api_name="Fly Clacio API",
            endpoint_configuration=apigw.EndpointConfiguration(
                types=[apigw.EndpointType.REGIONAL]
            ),
            deploy_options=apigw.StageOptions(stage_name="dev"),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=[
                    "http://localhost:3000",
                    "https://guests.flycalcio.pl"
                ],
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allow_headers=["Authorization", "Content-Type", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"],
                # allow_credentials=True,
                max_age=Duration.seconds(3600)
            )
        )
        
        api.add_gateway_response(
                "ForbiddenResponse",
                type=apigw.ResponseType.ACCESS_DENIED,
                response_headers={
                    "Access-Control-Allow-Origin": "method.request.header.origin",
                    # "Access-Control-Allow-Credentials": "'true'",
                },
            )
        
        # --- Create Lambda integrations ---
        public_integration = apigw.LambdaIntegration(public_lambda)
        private_integration = apigw.LambdaIntegration(private_lambda)
        auth_integration = apigw.LambdaIntegration(auth_lambda)
        guests_integration = apigw.LambdaIntegration(guests_lambda)
        events_integration = apigw.LambdaIntegration(events_lambda)
        
        
        # --- Define a Lambda authorizer ---
        authorizer = apigw.RequestAuthorizer(
            self,
            "LambdaRequestAuthorizer",
            handler=authorizer_lambda,
            identity_sources=[
                apigw.IdentitySource.header("Authorization")
            ],
            results_cache_ttl=Duration.seconds(0)
        )
        

        # /auth (for login/register)
        auth_resource = api.root.add_resource("auth")
        proxy = auth_resource.add_resource("{proxy+}")
        proxy.add_method(
            "ANY",
            auth_integration,
            method_responses=[
                apigw.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Origin": True,
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                    },
                )
            ],
        )
        

        # /private (protected route)
        private_resource = api.root.add_resource("private")
        proxy = private_resource.add_resource("{proxy+}")
        proxy.add_method(
            "ANY",
            private_integration,
            authorizer=authorizer,
            authorization_type=apigw.AuthorizationType.CUSTOM,
            method_responses=[
                apigw.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Origin": True,
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                    },
                )
            ],
        )
        
        
        # /actuals (protected route)
        guests_resource = api.root.add_resource("guests")
        # proxy = actuals_resource.add_resource("{proxy+}")
        guests_resource.add_method(
            "ANY",
            guests_integration,
            authorizer=authorizer,
            authorization_type=apigw.AuthorizationType.CUSTOM,
            method_responses=[
                apigw.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Origin": True,
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                    },
                )
            ],
        )
        
        # /category (protected route)
        events_resource = api.root.add_resource("events")
        # proxy = category_resource.add_resource("{proxy+}")
        events_resource.add_method(
            "ANY",
            events_integration,
            authorizer=authorizer,
            authorization_type=apigw.AuthorizationType.CUSTOM,
            method_responses=[
                apigw.MethodResponse(
                    status_code="200",
                    response_parameters={
                        "method.response.header.Access-Control-Allow-Origin": True,
                        "method.response.header.Access-Control-Allow-Headers": True,
                        "method.response.header.Access-Control-Allow-Methods": True,
                    },
                )
            ],
        )
        

        
        # Output API URL
        self.api_url = api.url
        
        
        resources_to_output = {
            "Lambdas": [public_lambda, private_lambda, guests_lambda,events_lambda,auth_lambda, authorizer_lambda],
            "Secrets": [jwt_secret,jwt_refresh_secret],
            "Api": [api]
        }
        
        


        # Lambdas
        for fn in resources_to_output["Lambdas"]:
            CfnOutput(self, f"{fn.node.id}Arn", value=fn.function_arn)

        # Secrets
        for s in resources_to_output["Secrets"]:
            CfnOutput(self, f"{s.node.id}Arn", value=s.secret_arn)

        # API Gateway
        CfnOutput(self, "ApiEndpoint", value=api.url)