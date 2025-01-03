from aws_cdk import (
    Stack,
    aws_sqs as sqs,
)
from constructs import Construct

from aws_cdk import aws_s3 as s3
from aws_cdk import Duration
from aws_cdk import CfnOutput
from aws_cdk import RemovalPolicy


class PyStarterStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        my_bucket = s3.Bucket(self, "PyBucket", lifecycle_rules=[
            s3.LifecycleRule(
                expiration=Duration.days(5)
            )]
        )

        CfnOutput(self, "PyBucketName", value=my_bucket.bucket_name)
        my_bucket.apply_removal_policy(RemovalPolicy.DESTROY)
        
