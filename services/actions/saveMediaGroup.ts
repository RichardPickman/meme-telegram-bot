import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const MEDIA_TABLE_NAME = process.env.MEDIA_TABLE_NAME || '';

export const saveGroupData = async (
    mediaGroupId: string,
    messageId: number,
) => {
    console.log('Saving media group data...');

    const putCommand = new PutCommand({
        TableName: MEDIA_TABLE_NAME,
        Item: {
            mediaGroupId,
            messageId,
        },
    });

    try {
        const response = await docClient.send(putCommand);

        return response;
    } catch (e) {
        console.log('Error saving media group data: ', e);

        return null;
    }
};

export const getMessageId = async (mediaGroupId: string) => {
    console.log('Getting message id...');

    const getCommand = new GetCommand({
        TableName: MEDIA_TABLE_NAME,
        Key: {
            mediaGroupId,
        },
    });

    try {
        const response = await docClient.send(getCommand);

        return response.Item?.messageId;
    } catch (e) {
        console.log('Error getting message id: ', e);

        return null;
    }
};
