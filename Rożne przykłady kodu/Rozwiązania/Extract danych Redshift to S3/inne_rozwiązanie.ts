import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as constructs from 'constructs';

export class GlueJobStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Tworzenie bucketu S3
    const bucket = new s3.Bucket(this, 'MyDataBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Uwaga: zmień na RETAIN w produkcji
    });

    // 2. Tworzenie roli dla Glue Job
    const glueRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    // 3. Przyznanie uprawnień do S3
    bucket.grantReadWrite(glueRole);

    // 4. Przyznanie uprawnień do Redshift
    glueRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRoleForRedshift'));

    // 5. Tworzenie Glue Job
    const glueJob = new glue.CfnJob(this, 'MyGlueJob', {
      role: glueRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${bucket.bucketName}/scripts/my_glue_script.py`, // Ścieżka do skryptu
        pythonVersion: '3',
      },
      defaultArguments: {
        '--TempDir': `s3://${bucket.bucketName}/temp/`,
        '--job-bookmark-option': 'job-bookmark-enable',
        '--redshift-table-name': 'my_table', // Nazwa tabeli w Redshift
        '--redshift-db-name': 'my_database', // Nazwa bazy danych Redshift
      },
      maxRetries: 0,
      timeout: 10,
      glueVersion: '2.0',
    });
  }
}
