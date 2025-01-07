from aws_cdk import (
    Stack,
)
from constructs import Construct

from aws_cdk import aws_s3 as s3
from aws_cdk import Duration
from aws_cdk import CfnOutput
from aws_cdk import RemovalPolicy
from aws_cdk import Fn
import aws_cdk as cdk


class PyStarterStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        suffix = self.__initialize_suffix()

        my_bucket = s3.Bucket(self, "PyBucket_2",
                              bucket_name=f"py-bucket-{suffix}",
                              lifecycle_rules=[
                                  s3.LifecycleRule(expiration=Duration.days(5))]
                              )

        CfnOutput(self, "PyBucketName: ", value=my_bucket.bucket_name)

        my_bucket.apply_removal_policy(RemovalPolicy.DESTROY)
        
        # Dodanie tagu
        cdk.Tags.of(my_bucket).add("suffix", suffix)

        my_bucket3 = s3.Bucket(self, "PyBucket_3",
                               bucket_name="pybucket333",
                               lifecycle_rules=[
                                   s3.LifecycleRule(expiration=Duration.days(33))]
                               )

        CfnOutput(self, "PyBucket_3_Name", value=my_bucket3.bucket_name)
        my_bucket3.apply_removal_policy(RemovalPolicy.DESTROY)

    # Tworzymy prywatną metodę inicjalizującą suffix
    def __initialize_suffix(self):
        # Fn.Select (2 - wybiera 3 część podzielonego ARN, split zwaca listę z podzielonego ARN
        short_stack_id = Fn.select(2, Fn.split('/', self.stack_id))
        # wybiera 5-ty fragment podzielonego ciągu 51af3dc0-da77-11e4-872e-1234567db123
        suffix = Fn.select(4, Fn.split('-', short_stack_id))
        return suffix

