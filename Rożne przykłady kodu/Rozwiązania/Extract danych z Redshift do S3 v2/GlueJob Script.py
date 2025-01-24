import sys
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
import boto3
import pyspark.sql.functions as F

# Initialize Glue context and job
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Redshift connection details
redshift_connection_name = "redshift-connection"
redshift_table = "reconciliation"

# S3 bucket details
s3_output_path = "s3://your-data-bucket-name/data/"

# Read data from Redshift into DataFrame using Glue connection
connection_options = {
    "dbtable": redshift_table,
    "connectionName": redshift_connection_name
}

df = glueContext.create_dynamic_frame.from_options(
    connection_type="redshift",
    connection_options=connection_options
).toDF()

# Perform any transformations if needed
# For example, let's just select all columns
df_transformed = df.select("*")

# Write the DataFrame to S3 in CSV format
df_transformed.write \
    .format("csv") \
    .option("header", "true") \
    .mode("overwrite") \
    .save(s3_output_path)

# Commit the job
job.commit()
