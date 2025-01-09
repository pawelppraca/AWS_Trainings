//importujemy typy
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

//definujemy funkcję handler - funkcja o nazwie handler jest wymagana
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    return {
        // to jest najprostrzy nic nie robiący kod który tworzymy aby był działający szkielet funkcji handler
        statusCode: 200,
        body: JSON.stringify('Hello ppp !')
    }
}


//aby funkcja handler była dostepna na zewnątrz musimy ja wyeksportować
export { handler }