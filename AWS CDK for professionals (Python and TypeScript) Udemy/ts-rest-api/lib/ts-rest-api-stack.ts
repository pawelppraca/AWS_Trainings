import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; //aby móc używać TS w kodzie stosu
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';

export class TsRestApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const employeesTable = new TableV2(this, 'Ts-EmplTable', {
      partitionKey: { //klucz podstawowy tabeli
        name: 'id', 
        type: AttributeType.STRING
      },
      billing: Billing.onDemand() //Rozliczanie zużycia przez tabelę dzięki temu nie naliczy kosztów
    });


    //Konstrukcja Lambdy
    const emplLambda = new NodejsFunction(this, "Ts-EmplLambda", {
      functionName: "EmployeeLambda",
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: (join(__dirname, '..', 'services', 'handler.ts')), //przy pomocy funkcji join budujemy ścieżkę do pliku z kodem do Lambdy względem tego pliku ze stosem
      environment: {
        TABLE_NAME: employeesTable.tableName //odwołanie do wczesniej utworzonej tabeli - patrz wyżej
      }
    })

    //dajemy uprawnienia Lambdzie żeby mogla wykonywac operacje na tabeli
    employeesTable.grantReadWriteData(emplLambda);


    //Konstrukcja API Gateway
    const api = new RestApi(this, 'EmlApi');
    const emplResource = api.root.addResource('empl'); //podaplikacja API

    //Łączenie API Gateway z Lambdą
    const emplLambdaIntegration = new LambdaIntegration (emplLambda)

    //Tworzymy metody w zasobie emplResource
    emplResource.addMethod('GET', emplLambdaIntegration)
    emplResource.addMethod('POST', emplLambdaIntegration)
  }
}

