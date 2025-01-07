import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import {aws_s3, Fn}  from 'aws-cdk-lib';


export class TsStarterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = this.initializeSuffix();

    const my_bucket = new aws_s3.Bucket(this, 'TsBucket', {
      bucketName : `ts-bucket-${suffix}`,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(5)
        }
      ]
    })

    new cdk.CfnOutput(this, "TsBucketName",{value: my_bucket.bucketName})
    my_bucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    cdk.Tags.of(my_bucket).add("suffix", suffix)

  }

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split('/', this.stackId))
    const suffix = Fn.select(4, Fn.split('-', shortStackId))
    return suffix;
  }

}
