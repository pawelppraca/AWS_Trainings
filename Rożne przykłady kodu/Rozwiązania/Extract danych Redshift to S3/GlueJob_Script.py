import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Define the Redshift connection
redshift_connection_options = {
    "url": "jdbc:redshift://<redshift-cluster-endpoint>:5439/<database>",
    "tempdir": "s3://<temporary-bucket>/temp/",
    "aws_iam_role": "<IAM-role-ARN>"
}

# Read data from Redshift
dyf = glueContext.create_dynamic_frame.from_options(
    connection_type="redshift",
    connection_options=redshift_connection_options,
    table_name="<schema>.<table>"
)

# Write data to Parquet files in S3
glueContext.write_dynamic_frame.from_options(
    frame=dyf,
    connection_type="s3",
    connection_options={"path": "s3://<destination-bucket>/output/"},
    format="parquet"
)

job.commit()
