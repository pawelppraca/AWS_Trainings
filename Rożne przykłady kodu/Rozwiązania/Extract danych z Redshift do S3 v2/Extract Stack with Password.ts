//Aby zdefiniować połączenie do Redshift w CloudFormation za pomocą AWS CDK i TypeScript, możemy użyć zasobu AWS::Glue::Connection. Poniżej znajdziesz przykładowy kod, który tworzy połączenie do Redshift w CDK:

//Pamiętaj, aby zastąpić your-security-group-id, your-redshift-cluster-endpoint, your-database, your-username, oraz your-password odpowiednimi wartościami dla Twojego środowiska.

import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class GlueRedshiftConnectionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the VPC and security group for the Redshift connection
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true });
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', 'your-security-group-id');

    // Define the IAM role for the Glue Job
    const glueJobRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    // Define the Glue Connection to Redshift
    const redshiftConnection = new glue.CfnConnection(this, 'RedshiftConnection', {
      catalogId: cdk.Aws.ACCOUNT_ID,
      connectionInput: {
        name: 'redshift-connection',
        connectionType: 'JDBC',
        connectionProperties: {
          JDBC_CONNECTION_URL: 'jdbc:redshift://your-redshift-cluster-endpoint:5439/your-database',
          USERNAME: 'your-username',
          PASSWORD: 'your-password',
        },
        physicalConnectionRequirements: {
          subnetId: vpc.privateSubnets[0].subnetId,
          securityGroupIdList: [securityGroup.securityGroupId],
        },
      },
    });

    // Grant necessary permissions to the role
    redshiftConnection.grantRead(glueJobRole);
  }
}

const app = new cdk.App();
new GlueRedshiftConnectionStack(app, 'GlueRedshiftConnectionStack');
app.synth();
