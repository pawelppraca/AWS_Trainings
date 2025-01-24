import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as redshift from 'aws-cdk-lib/aws-redshift';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class RedshiftToS3GlueStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // S3 bucket to store extracted data
        const bucket = new s3.Bucket(this, 'RedshiftExtractBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // IAM Role for Glue Job
        const glueRole = new iam.Role(this, 'GlueJobRole', {
            assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
        });

        // Attach policies to the role
        glueRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                's3:PutObject',
                's3:PutObjectAcl',
                's3:GetObject',
                's3:ListBucket',
            ],
            resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        }));

        glueRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'redshift:GetClusterCredentials',
                'redshift:DescribeClusters',
                'redshift:DescribeTable',
                'redshift:Select',
            ],
            resources: ['*'],
        }));

        // Redshift cluster
        const redshiftCluster = new redshift.Cluster(this, 'RedshiftCluster', {
            masterUser: {
                masterUsername: 'admin',
            },
            vpc: new ec2.Vpc(this, 'Vpc'),
            defaultDatabaseName: 'mydatabase',
        });

        // Glue Job
        const glueJob = new glue.CfnJob(this, 'RedshiftToS3GlueJob', {
            role: glueRole.roleArn,
            command: {
                name: 'glueetl',
                scriptLocation: `s3://${bucket.bucketName}/scripts/redshift_extract.py`,
                pythonVersion: '3',
            },
            defaultArguments: {
                '--TempDir': `s3://${bucket.bucketName}/temp/`,
                '--job-language': 'python',
                '--extra-py-files': 's3://path-to-your-extra-py-files.zip',
                '--enable-metrics': '',
                '--enable-continuous-cloudwatch-log': 'true',
                '--enable-continuous-log-filter': 'true',
            },
            maxRetries: 1,
            timeout: 2880,
            glueVersion: '2.0',
            numberOfWorkers: 2,
            workerType: 'G.1X',
        });

        new cdk.CfnOutput(this, 'GlueJobName', {
            value: glueJob.ref,
        });
    }
}

const app = new cdk.App();
new RedshiftToS3GlueStack(app, 'RedshiftToS3GlueStack');
app.synth();