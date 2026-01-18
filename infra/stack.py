from aws_cdk import (
    Stack,
    aws_s3 as s3,
    CfnOutput,
)
from constructs import Construct

class InfraStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        bucket = s3.Bucket(
            self,
            "flycalcio-frontend-bucket",
            bucket_name='guests.flycalcio.pl',
            website_index_document="index.html",
            website_error_document="index.html",
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            public_read_access=True
        )
        
        
        
        

        CfnOutput(
            self,
            "FrontendBucketName",
            value=bucket.bucket_name
        )
        CfnOutput(
            self,
            "FrontendBucketUrl",
            value=bucket.bucket_website_url
        )
