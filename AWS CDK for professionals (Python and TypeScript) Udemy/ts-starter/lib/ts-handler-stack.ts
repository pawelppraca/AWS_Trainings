import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import {aws_s3, Fn}  from 'aws-cdk-lib';
import { Runtime, Code, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';


//Tworzymy Interface rozszerzający klasę cdk.StackProps o nowy element
interface TsHandlerStackProps extends cdk.StackProps{
    sharedBucket: aws_s3.Bucket;
}

export class TsHandlerStack extends cdk.Stack {

  public sharedBucket: aws_s3.Bucket;

  //W konstruktorze dodajmemy parametr obowiązkowy (bez pytajnika) z nowej klasy/interfaceu TsHandlerStackProps
  constructor(scope: Construct, id: string, props: TsHandlerStackProps) {
    super(scope, id, props);

    new LambdaFunction(this, 'LFSharingHandler', {
        runtime: Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: Code.fromInline(
            `exports.handler = async (event) => {
                console.log("env bucket: "+ process.env.SHARED_BUCKET_ARN)
            };`
        ),
        //Tu przekazujemy odwołanie do bucketa z innego stosu czyli props.sharedBucket.bucketArn, ten paramter będzie przekazany w konstruktorze
        environment: {
            SHARED_BUCKET_ARN: props.sharedBucket.bucketArn,
        },
    });



  }
}