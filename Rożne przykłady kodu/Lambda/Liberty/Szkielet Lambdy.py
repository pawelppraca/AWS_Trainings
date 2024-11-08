
# Lambda function that will be responsible for the integration tests

import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import json
import logging
from io import StringIO, BytesIO
import os
import pandas as pd
import pathlib
import sys
import threading
import time
from typing import Dict, Optional, Union, Callable
from urllib import parse
import uuid


SOURCE_BUCKET_NAME = os.getenv("BUCKET_NAME", "aws-ppp-sources")
SOURCE_S3_KEY = "json_files/run_results_coverage_alias.json"
SOURCE_S3_URI = f"s3://{BUCKET_NAME}/{SOURCE_S3_KEY}"

DEST_BUCKET_NAME = os.getenv("BUCKET_NAME", "aws-ppp-destinations")
DESTINATION_S3_KEY = "staging_test/integration_test/integration_test.parquet"



logger = logging.getLogger()
logger.setLevel("INFO")


def handler(event, context):
    logger.info(f"event: {str(event)}")
    logger.info(f"context: {str(context)}")

    try:
        logger.info(f"Removing previous run's manifest entry to clear test state")




    except Exception as error:
        logger.error(error)
        resp = {
            "response_code": 400,
            "test_result": "FAILED",
            "failure response": str(error),
        }
        return resp
