import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as redshift from 'aws-cdk-lib/aws-redshift';

export class GlueJobStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the existing S3 bucket for scripts and data
    const scriptBucket = s3.Bucket.fromBucketName(this, 'ScriptBucket', 'glue-scripts');
    const dataBucket = s3.Bucket.fromBucketName(this, 'DataBucket', 'your-data-bucket-name');

    // Define the IAM role for the Glue Job
    const glueJobRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    // Grant necessary permissions to the role
    scriptBucket.grantRead(glueJobRole);
    dataBucket.grantReadWrite(glueJobRole);

    // Define the existing PipelineDeployment role
    const pipelineDeploymentRole = iam.Role.fromRoleArn(this, 'PipelineDeploymentRole', 'arn:aws:iam::your-account-id:role/PipelineDeployment');

    // Grant write access to the script bucket for the PipelineDeployment role
    scriptBucket.grantWrite(pipelineDeploymentRole);

    // Define the Glue Job
    const glueJob = new glue.CfnJob(this, 'GlueJob', {
      role: glueJobRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${scriptBucket.bucketName}/extract.py`,
        pythonVersion: '3',
      },
      defaultArguments: {
        '--TempDir': `s3://${dataBucket.bucketName}/temp/`,
        '--job-bookmark-option': 'job-bookmark-enable',
      },
      maxRetries: 1,
      timeout: 2880, // Timeout in minutes (48 hours)
      glueVersion: '2.0',
      numberOfWorkers: 2,
      workerType: 'G.1X',
    });

    // Define the Redshift cluster and database
    const redshiftCluster = redshift.Cluster.fromClusterAttributes(this, 'RedshiftCluster', {
      clusterName: 'your-redshift-cluster-name',
      clusterEndpointAddress: 'your-redshift-cluster-endpoint',
      clusterEndpointPort: 5439,
      securityGroups: [],
    });

    // Add Redshift connection details to the Glue Job
    glueJob.addPropertyOverride('Connections', {
      Connections: ['your-redshift-connection-name'],
    });
  }
}

const app = new cdk.App();
new GlueJobStack(app, 'GlueJobStack');
app.synth();
