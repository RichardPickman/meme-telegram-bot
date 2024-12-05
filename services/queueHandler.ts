import {
    SQSClient,
    SendMessageCommand,
    SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { SQSEvent } from 'aws-lambda';

const QUEUE_URL = process.env.MEME_TELEGRAM_QUEUE_URL!;

const client = new SQSClient();

export const handler = async (event: SQSEvent) => {
    const params: SendMessageCommandInput = {
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(event),
    };

    const message = await client.send(new SendMessageCommand(params));

    console.log('Successfully sent message to queue. Message: ', message);

    return {
        statusCode: 200,
        body: JSON.stringify(message),
    };
};
