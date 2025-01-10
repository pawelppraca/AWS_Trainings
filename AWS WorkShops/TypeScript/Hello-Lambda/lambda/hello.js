//To jest plik JavaScript do wywołania przez Lambdę

exports.handler = async function (event) {
    console.log('request:', JSON.stringify(event, undefined, 2))
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: `Hello, CDK by PPP! You've hit ${event.path}\n`,
  }
    
}