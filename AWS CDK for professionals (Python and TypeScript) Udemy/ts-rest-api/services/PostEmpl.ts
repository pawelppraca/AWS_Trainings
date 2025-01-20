import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";



export async function postEmpl(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {

    if (event.body) {
        const randomId = randomUUID(); //generowanie losowego ID
        const item = JSON.parse(event.body) //czytanie zawartości odpowiedzi
        item.id = randomId;

        await ddbClient.send(new PutItemCommand({ //Funkcja PutItemCommand wstawia dane do tabeli
            TableName: process.env.TABLE_NAME,
            Item: marshall(item) //konweruje obiekt JSON na rekord DynamoDB
        }));

        return {
            statusCode: 201,
            body: JSON.stringify(randomId) //Po dodaniu wpisu do tabeli zwracamy ID
        }
    }

    return {
        statusCode: 403,
        body: JSON.stringify('Request body required!') //konwertuje wartość Javascript na JSON
    }

}