import {
    SQSClient,
    SendMessageCommand,
    SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { APIGatewayProxyEvent } from 'aws-lambda';

const QUEUE_URL = process.env.MEME_TELEGRAM_QUEUE_URL!;

const client = new SQSClient();

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log('Starting handler... Event: ', event);

    const body = event.body;

    if (!body) {
        console.log('No body found in event. Terminating...');

        return {
            statusCode: 200,
        };
    }

    const params: SendMessageCommandInput = {
        QueueUrl: QUEUE_URL,
        MessageBody: body,
    };

    const message = await client.send(new SendMessageCommand(params));

    console.log('Successfully sent message to queue. Message: ', message);

    return {
        statusCode: 200,
        body: JSON.stringify(message),
    };
};
