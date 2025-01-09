import boto3
import botocore


def copy_s3_object(source_bucket, source_key, dest_bucket, dest_key):
    s3 = boto3.client('s3')
    try:
        copy_source = {
            'Bucket': source_bucket,
            'Key': source_key
        }
        s3.copy_object(CopySource=copy_source,
                       Bucket=dest_bucket, Key=dest_key)
        print(f'Successfully copied {source_key} from {
              source_bucket} to {dest_key} in {dest_bucket}')
    except botocore.exceptions.ClientError as e:
        print(f'Error copying object: {e}')


def copy_s3_folder(source_bucket, source_prefix, dest_bucket, dest_prefix):
    s3 = boto3.client('s3')
    paginator = s3.get_paginator('list_objects_v2')
    try:
        for page in paginator.paginate(Bucket=source_bucket, Prefix=source_prefix):
            for obj in page.get('Contents', []):
                source_key = obj['Key']
                dest_key = source_key.replace(source_prefix, dest_prefix, 1)
                copy_source = {
                    'Bucket': source_bucket,
                    'Key': source_key
                }
                s3.copy_object(CopySource=copy_source,
                               Bucket=dest_bucket, Key=dest_key)
                print(f'Successfully copied {source_key} to {dest_key}')
    except botocore.exceptions.ClientError as e:
        print(f'Error copying objects: {e}')


def main():
    source_bucket = 'aws-ppp-sources'
    source_key = 'dane_RS/tabela_parquet'
    dest_bucket = 'aws-ppp-destinations'
    dest_key = 'dane_docelowe/tabela_parquet'

    copy_s3_object(source_bucket, source_key, dest_bucket, dest_key)


if __name__ == "__main__":
    main()
