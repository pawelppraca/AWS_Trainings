import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; //aby móc używać TS w kodzie stosu
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

export class TsRestApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Konstrukcja Lambdy
    const emplLambda = new NodejsFunction(this, "Ts-EmplLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: (join(__dirname, '..', 'services', 'handler.ts')) //przy pomocy funkcji join budujemy ścieżkę do pliku z kodem do Lambdy względem tego pliku ze stosem
    })

    //Konstrukcja API Gateway
    const api = new RestApi(this, 'EmlApi');
    const emplResource = api.root.addResource('empl');

  }
}

