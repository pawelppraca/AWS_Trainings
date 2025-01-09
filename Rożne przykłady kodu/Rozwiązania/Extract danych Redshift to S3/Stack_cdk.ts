import * as cdk from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class RedshiftGlueIamRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tworzenie bucketu S3
    const s3Bucket = new Bucket(this, 'MyDataBucket', {
      bucketName: 'my-data-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Ustawienie polityki usuwania
    });

    // Tworzenie roli IAM dla Redshift
    const redshiftRole = new Role(this, 'RedshiftRole', {
      assumedBy: new ServicePrincipal('redshift.amazonaws.com'),
    });
    redshiftRole.addToPolicy(new PolicyStatement({
      actions: ['s3:PutObject', 's3:GetObject', 's3:ListBucket'],
      resources: [`${s3Bucket.bucketArn}/*`],
    }));

    // Tworzenie roli IAM dla Glue
    const glueRole = new Role(this, 'GlueRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
    });
    glueRole.addToPolicy(new PolicyStatement({
      actions: ['s3:PutObject', 's3:GetObject', 's3:ListBucket', 'redshift:DescribeClusters', 'redshift:GetClusterCredentials', 'redshift:CopyFromS3', 'redshift:Unload'],
      resources: ['*'],
    }));

    // Przyznanie uprawnień do zapisu do bucketu S3
    s3Bucket.grantReadWrite(glueRole);
  }
}

const app = new cdk.App();
new RedshiftGlueIamRoleStack(app, 'RedshiftGlueIamRoleStack');
