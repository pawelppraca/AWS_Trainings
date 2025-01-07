from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_lambda
)
from constructs import Construct


class PyHandlerStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, bucket: s3.Bucket, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # definiujemy funkcję Lambda która będzie korzystała z Bucketa utworzonego w innym stosie
        aws_lambda.Function(self, "aws-ppp-cdk-PySharingLambda",
                            code=aws_lambda.Code.from_inline(
                                "import os\ndef handler(event, context): \n print(os.environ['PY_SHARED_BUCKET'])"),
                            handler='index.handler',  # to ".handler" jest tym samym co handler linijka wyżej
                            runtime=aws_lambda.Runtime.PYTHON_3_11,
                            environment={
                                "PY_SHARED_BUCKET": bucket.bucket_arn
                            }
                            )
