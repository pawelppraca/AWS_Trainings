import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export class GlueJobMonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an SNS topic for notifications
        const topic = new sns.Topic(this, 'GlueJobMonitoringTopic');

        // Add an email subscription to the SNS topic
        topic.addSubscription(new sns_subscriptions.EmailSubscription('your-email@example.com'));

        // Define the Glue Job
        const glueJob = new glue.CfnJob(this, 'MyGlueJob', {
            name: 'my-glue-job',
            role: 'arn:aws:iam::your-account-id:role/your-glue-role',
            command: {
                name: 'glueetl',
                scriptLocation: 's3://your-script-location/script.py',
            },
            defaultArguments: {
                '--TempDir': 's3://your-temp-dir/',
                '--job-bookmark-option': 'job-bookmark-enable',
            },
            maxRetries: 1,
            timeout: 2880,
        });

        // Create CloudWatch Alarms for Glue Job
        const glueJobFailedAlarm = new cloudwatch.Alarm(this, 'GlueJobFailedAlarm', {
            metric: new cloudwatch.Metric({
                namespace: 'Glue',
                metricName: 'GlueJobRunFailed',
                dimensionsMap: {
                    JobName: glueJob.name,
                },
                statistic: 'sum',
                period: cdk.Duration.minutes(1),
            }),
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: 'Alarm when Glue Job fails',
            alarmName: 'GlueJobFailedAlarm',
        });

        // Add SNS topic as an alarm action
        glueJobFailedAlarm.addAlarmAction(new cloudwatch.actions.SnsAction(topic));
    }
}

const app = new cdk.App();
new GlueJobMonitoringStack(app, 'GlueJobMonitoringStack');