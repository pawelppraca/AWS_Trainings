import sys
import boto3
from awsglue.context import GlueContext
from pyspark.context import SparkContext
from pyspark.sql import SparkSession

# Inicjalizacja kontekstu Glue
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session

# Parametry połączenia JDBC do Redshift
redshift_url = "jdbc:redshift://<your-cluster-name>:5439/<your-database-name>"
redshift_properties = {
    "user": "<your-username>",
    "password": "<your-password>",
    "driver": "com.amazon.redshift.jdbc.Driver"
}

# Funkcja wykonująca zapytanie TRUNCATE na tabeli
def truncate_table():
    try:
        # Przygotowanie zapytania SQL
        table_name = "<your_table_name>"  # Zmień na nazwę tabeli, którą chcesz wyczyścić
        query = f"TRUNCATE TABLE {table_name};"
        
        # Wykonanie zapytania TRUNCATE przez JDBC
        # W tym przypadku używamy SQLContext do wykonania zapytania SQL
        jdbc_url = f"jdbc:redshift://<your-cluster-name>:5439/<your-database-name>"
        connection_properties = {
            "user": "<your-username>",
            "password": "<your-password>",
            "driver": "com.amazon.redshift.jdbc.Driver"
        }

        # Wykonanie zapytania TRUNCATE poprzez JDBC
        spark.read.jdbc(url=jdbc_url, table=f"({query}) AS query", properties=connection_properties)

        print(f"Table {table_name} has been truncated successfully.")
    
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    truncate_table()