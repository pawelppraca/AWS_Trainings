// Rola która daje dostęp do Redhisfta do odczytu danych z Tabel

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