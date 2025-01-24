// Aby skonfigurować monitoring dla AWS Glue Jobów przy użyciu AWS CDK i TypeScript, możesz skorzystać z Amazon CloudWatch do zbierania i monitorowania metryk oraz logów. Poniżej znajdziesz przykładowy kod, który definiuje Glue Job oraz konfiguruje alarmy CloudWatch i dashboard do monitorowania Glue Jobów.

// Definiowanie Glue Job:
// Konfigurowanie alarmów CloudWatch:
// Tworzenie dashboardu CloudWatch:

// W powyższym kodzie:

// Tworzymy Glue Job z włączonymi metrykami i Job Insights.
// Konfigurujemy alarm CloudWatch, który uruchamia się, gdy Glue Job zakończy się niepowodzeniem.
// Tworzymy dashboard CloudWatch, który wyświetla metryki dotyczące Glue Jobów, takie jak liczba niepowodzeń i czas trwania zadań.
// Pamiętaj, aby zastąpić your-data-bucket-name odpowiednią nazwą Twojego bucketu S3.



import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class GlueJobMonitoringStack extends cdk.Stack {
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
        '--enable-metrics': '',
        '--enable-job-insights': 'true',
      },
      maxRetries: 1,
      timeout: 2880, // Timeout in minutes (48 hours)
      glueVersion: '2.0',
      numberOfWorkers: 2,
      workerType: 'G.1X',
    });

    // Define CloudWatch Alarms
    const failedJobsAlarm = new cloudwatch.Alarm(this, 'FailedJobsAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'Glue',
        metricName: 'GlueJobRunFailed',
        dimensionsMap: {
          JobName: glueJob.ref,
        },
        statistic: 'sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Alarm when Glue Job fails',
    });

    // Define SNS Topic for alarm notifications
    const alarmTopic = new sns.Topic(this, 'AlarmTopic');
    failedJobsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));

    // Define CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'GlueJobDashboard', {
      dashboardName: 'GlueJobMonitoringDashboard',
    });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Glue Job Failures',
        left: [failedJobsAlarm.metric],
      }),
      new cloudwatch.GraphWidget({
        title: 'Glue Job Duration',
        left: [
          new cloudwatch.Metric({
            namespace: 'Glue',
            metricName: 'GlueJobRunTime',
            dimensionsMap: {
              JobName: glueJob.ref,
            },
            statistic: 'avg',
            period: cdk.Duration.minutes(5),
          }),
        ],
      })
    );
  }
}

const app = new cdk.App();
new GlueJobMonitoringStack(app, 'GlueJobMonitoringStack');
app.synth();
