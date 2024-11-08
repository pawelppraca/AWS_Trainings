import json
from pathlib import Path
import pandas as pd
import boto3
from botocore.exceptions import ClientError
import logging
import psycopg2
import io    
import os
import pathlib
import awswrangler as wr


#from io import StringIO, BytesIO
# import sys
# import threading
# import time
# from typing import Dict, Optional, Union, Callable
# from urllib import parse
# import uuid

AWS_POSTGRES_RDS = "ppp-postgresql-01.cfc6ec2aoks3.us-east-1.rds.amazonaws.com"
AWS_POSTGRES_RDS_DB = "aws-ppp-test"

SOURCE_BUCKET_NAME = os.getenv("BUCKET_NAME", "aws-ppp-sources")
SOURCE_S3_KEY = "json_files/run_results_coverage_alias.json"
SOURCE_S3_URI = f"s3://{SOURCE_BUCKET_NAME}/{SOURCE_S3_KEY}"

DEST_BUCKET_NAME = os.getenv("BUCKET_NAME", "aws-ppp-destinations")
DEST_S3_KEY = "staging_test/integration_test/integration_test.parquet"
DEST_S3_URI = f"s3://{DEST_BUCKET_NAME}/{DEST_S3_KEY}"

DB_CONNECTION = f"jdbc:postgresql://{AWS_POSTGRES_RDS}:5432/{AWS_POSTGRES_RDS_DB}"


logger = logging.getLogger()
logger.setLevel("INFO")


def handler(event, context):
    logger.info(f"event: {str(event)}")
    logger.info(f"context: {str(context)}")

    try:
        logger.info(f"Startowanie Lambdy")
        filepath = SOURCE_S3_URI
        path = Path(filepath)
        if path.exists():
            content = path.read_text()
            new_json = json.loads(content)
            result_row = {}
            results_data = []

            for i in range(len(new_json['results'])):
                
                result_row['unique_id']= new_json['results'][i]['unique_id']
                result_row['status'] = new_json['results'][i]['status']
                result_row['execution_time'] = new_json['results'][i]['execution_time']
                result_row['message'] = new_json['results'][i]['message']
                result_row['fail_rows'] = new_json['results'][i]['failures']
                result_row['table_name'] = new_json['results'][i]['relation_name']
                
                for j in range(len(new_json['results'][i]['timing'])):
                    if new_json['results'][i]['timing'][j]['name'] == 'execute':
                        result_row['start_time'] = new_json['results'][i]['timing'][j]['started_at']
                        result_row['completed_time'] = new_json['results'][i]['timing'][j]['completed_at']
                                
                results_data.append(result_row.copy())
                result_row.clear()
            
            # for k in range(len(results_data)):
            #     data = results_data[k]
            #     print (data['table_name'])
            
            # row = results_data[1]
            
            # for key in row.keys():
            #     print ('Klucz:' + key +'; Wartość: ' + row[key])

            # Create Dataframe
            
            df = pd.DataFrame.from_records(results_data)

            # Storing data on Parquet File
            wr.s3.to_parquet(
                df=df,
                path=DEST_S3_URI,
                dataset=True
            )
            
            # Zapisanie danych do Bazy Danych

            dbcon = wr.postgresql.connect(DB_CONNECTION)
            wr.postgresql.to_sql(df, dbcon, schema="aws-ppp-01", table="example_test", mode="overwrite")
            dbcon.close()
            


        # zapisac dane do dataframe
        # zapisac dane do tabeli w Redshift        

        return {
            'statusCode': 200,
            "test_result": "SUCCESS",
            'body': json.dumps('AWS-PPP-Save-Json-to-pgsql-test - Success!')
        }

    except Exception as error:
        logger.error(error)
        resp = {
            "response_code": 400,
            "test_result": "FAILED",
            "failure response": str(error),
        }
        return resp

