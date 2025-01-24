//Aby połączyć się z Redshift przy użyciu roli IAM zamiast podawania danych logowania, musimy skonfigurować AWS Glue Connection z odpowiednimi uprawnieniami. Poniżej znajdziesz zaktualizowany kod w TypeScript z użyciem AWS CDK, który definiuje połączenie do Redshift z wykorzystaniem roli IAM.

//Najpierw upewnij się, że rola IAM ma odpowiednie uprawnienia do dostępu do Redshift. Możesz użyć istniejącej roli lub utworzyć nową rolę z odpowiednimi uprawnieniami.

//W tym kodzie RedshiftIAMRole to rola IAM, która ma uprawnienia do dostępu do Redshift. Upewnij się, że zastąpiłeś your-security-group-id, your-redshift-cluster-endpoint, your-database, oraz your-account-id odpowiednimi wartościami dla Twojego środowiska.

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

    // Attach policy to allow Glue to assume the role
    glueJobRole.addToPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: ['arn:aws:iam::your-account-id:role/RedshiftIAMRole'],
    }));

    // Define the Glue Connection to Redshift using IAM Role
    const redshiftConnection = new glue.CfnConnection(this, 'RedshiftConnection', {
      catalogId: cdk.Aws.ACCOUNT_ID,
      connectionInput: {
        name: 'redshift-connection',
        connectionType: 'JDBC',
        connectionProperties: {
          JDBC_CONNECTION_URL: 'jdbc:redshift://your-redshift-cluster-endpoint:5439/your-database',
          IAM_ROLE: 'arn:aws:iam::your-account-id:role/RedshiftIAMRole',
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
