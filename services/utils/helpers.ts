import { APIGatewayProxyEvent } from 'aws-lambda';

export const getBodyOrNull = (event: APIGatewayProxyEvent) =>
    event.body ? JSON.parse(event.body) : null;
