// Rola która daje dostęp do Redhisfta do odczytu danych z Tabel
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class RedshiftIamRoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tworzenie roli IAM dla Redshift
    const redshiftRole = new iam.Role(this, 'RedshiftRole', {
      assumedBy: new iam.ServicePrincipal('redshift.amazonaws.com'),
      description: 'IAM Role for Redshift to access data from tables',
    });

    // Dodanie polityki uprawnień do roli
    redshiftRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'redshift:GetClusterCredentials',
        'redshift:DescribeClusters',
        'redshift:ExecuteQuery',
        'redshift:Select'
      ],
      resources: ['*'], // Możesz ograniczyć zasoby do konkretnych klastrów lub tabel
    }));
  }
}

const app = new cdk.App();
new RedshiftIamRoleStack(app, 'RedshiftIamRoleStack');



//Aby przypisać rolę IAM do istniejącego klastra Redshift, który został utworzony w innym stacku, możesz użyć AWS CDK w TypeScript. Oto przykładowy kod, który pokazuje, jak to zrobić:

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as redshift from 'aws-cdk-lib/aws-redshift';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AssignIamRoleToRedshiftClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Importowanie istniejącego klastra Redshift
    const cluster = redshift.Cluster.fromClusterAttributes(this, 'ExistingRedshiftCluster', {
      clusterName: 'my-existing-cluster',
      clusterEndpointAddress: 'my-existing-cluster.abc123xyz.us-west-2.redshift.amazonaws.com',
      clusterEndpointPort: 5439,
      securityGroups: [], // Dodaj odpowiednie grupy zabezpieczeń
    });

    // Tworzenie roli IAM dla Redshift
    const redshiftRole = new iam.Role(this, 'RedshiftRole', {
      assumedBy: new iam.ServicePrincipal('redshift.amazonaws.com'),
      description: 'IAM Role for Redshift to access data from tables',
    });

    // Dodanie polityki uprawnień do roli
    redshiftRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'redshift:GetClusterCredentials',
        'redshift:DescribeClusters',
        'redshift:ExecuteQuery',
        'redshift:Select'
      ],
      resources: ['*'], // Możesz ograniczyć zasoby do konkretnych klastrów lub tabel
    }));

    // Przypisanie roli IAM do istniejącego klastra Redshift
    cluster.addIamRole(redshiftRole);
  }
}

const app = new cdk.App();
new AssignIamRoleToRedshiftClusterStack(app, 'AssignIamRoleToRedshiftClusterStack');
