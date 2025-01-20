//importujemy typy
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { getEmpl } from "./GetEmpl"
import { postEmpl } from "./PostEmpl"

//Tworzymy połaczenie do DynamoDB
const ddbClient = new DynamoDBClient({})

//definujemy funkcję handler - funkcja o nazwie handler jest wymagana
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let response:  APIGatewayProxyResult = {} as any;

    try {
        switch (event.httpMethod) {
            case 'GET':
                const getResponse = await getEmpl(event, ddbClient);
                response = getResponse;
                break;
            case 'POST':
                const postResponse = await postEmpl(event, ddbClient);
                response = postResponse;
                break;
        }
    } catch (error) {
        response = {
            statusCode: 400,
            body: JSON.stringify(error.message) //aby tu nie pojawiał się niezany typ należy w pliku tsconfig.json dodać "useUnknownInCatchVariables": false,
        }
    }


    response.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    return response;
}


//aby funkcja handler była dostepna na zewnątrz musimy ja wyeksportować
export { handler }