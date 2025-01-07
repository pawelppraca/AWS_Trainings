import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import {aws_s3, Fn}  from 'aws-cdk-lib';


export class TsSharedStack extends cdk.Stack {

  public sharedBucket: aws_s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = this.initializeSuffix();

    //przez this.sharedBucket odwołujemy się do wystawionego zasobu na zewnątrz
    this.sharedBucket = new aws_s3.Bucket(this, 'TsSharedBucket', {
      bucketName : `ts-shared-bucket-${suffix}`,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(5)
        }
      ]
    })

    //przez this.sharedBucket odwołujemy się do wystawionego zasobu na zewnątrz
    new cdk.CfnOutput(this, "TsSharedBucketName",{value: this.sharedBucket.bucketName})
    this.sharedBucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    //przez this.sharedBucket odwołujemy się do wystawionego zasobu na zewnątrz
    cdk.Tags.of(this.sharedBucket).add("suffix", suffix)

  }

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split('/', this.stackId))
    const suffix = Fn.select(4, Fn.split('-', shortStackId))
    return suffix;
  }

}
