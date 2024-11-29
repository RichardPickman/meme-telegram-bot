import { QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
    PutCommand,
    PutCommandInput,
    QueryCommandInput,
    ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { inspect } from 'util';
import { Meme } from '../../types';
import { dbClient } from '../instances/db';

const getCurrentTimeFrame = () => {
    const publishTime = new Date();

    publishTime.setSeconds(0);
    publishTime.setMilliseconds(0);

    return publishTime;
};

const queryDatabase = async (command: QueryCommandInput) => {
    try {
        const data = await dbClient.send(new QueryCommand(command));

        console.log('Data requested. Response: ', data);

        if (!data.Items) {
            console.log('Items is undefined.');

            return null;
        }

        if (data.Items.length === 0) {
            console.log('No item found');

            return null;
        }

        const result = data.Items[0];

        return unmarshall(result);
    } catch (error) {
        console.error('Error: ', error);

        return null;
    }
};

const scanDatabase = async (command: ScanCommandInput) => {
    try {
        const data = await dbClient.send(new ScanCommand(command));

        console.log(
            'Data requested. Response: ',
            inspect(data, {
                depth: Infinity,
            }),
        );

        if (!data.Items) {
            console.log('Items is undefined.');

            return null;
        }

        if (data.Items.length === 0) {
            console.log('No item found');

            return null;
        }

        const result = data.Items[0];

        return unmarshall(result);
    } catch (error) {
        console.error('Error: ', error);

        return null;
    }
};

export const getCurrentTimeFrameMeme = async (TableName: string) => {
    console.log('Getting current time frame meme...');

    const publishTime = getCurrentTimeFrame();

    console.log('Publish time: ', publishTime);

    const params: QueryCommandInput = {
        TableName,
        Limit: 1,
        KeyConditionExpression: 'publishTime = :publishTime',
        ExpressionAttributeValues: marshall({
            ':publishTime': publishTime.toISOString(),
        }),
    };

    const meme = await queryDatabase(params);

    if (!meme) {
        return null;
    }

    return meme;
};

export const getLatestSavedMeme = async (TableName: string) => {
    console.log('Getting latest saved meme...');

    const params = {
        TableName,
        ScanIndexForward: false,
        Limit: 1,
    };

    const meme = (await scanDatabase(params)) as Meme | null;

    if (!meme) {
        return null;
    }

    return { ...meme, publishTime: new Date(meme.publishTime) };
};

const getClosestTimeFrame = (publishTime: Date) => {
    const isPastMid = publishTime.getMinutes() >= 30;

    if (isPastMid) {
        const currentHour = publishTime.getHours();

        publishTime.setHours(currentHour + 1);
        publishTime.setMinutes(0);
        publishTime.setSeconds(0);
        publishTime.setMilliseconds(0);

        return publishTime;
    }

    if (!isPastMid) {
        publishTime.setMinutes(30);
        publishTime.setSeconds(0);
        publishTime.setMilliseconds(0);

        return publishTime;
    }

    return publishTime;
};

const constructMeme = (messageId: string, publishTime: Date): Meme => ({
    id: randomUUID(),
    messageId,
    isPublished: false,
    publishTime: getClosestTimeFrame(publishTime),
    createdAt: Date.now(),
});

export const saveMeme = async (messageId: string, publishTime: Date) => {
    console.log('Saving meme...');

    const meme = constructMeme(messageId, publishTime);

    const params: PutCommandInput = {
        TableName: process.env.MEME_DATABASE_TABLE_NAME!,
        Item: {
            ...meme,
            publishTime: new Date(meme.publishTime).toISOString(),
        },
    };

    try {
        await dbClient.send(new PutCommand(params));

        console.log('Meme saved. Meme: ', meme);

        return meme;
    } catch (error) {
        console.log('Error while saving meme: ', error);

        return null;
    }
};

export const updateMeme = async (meme: Meme) => {
    const params: PutCommandInput = {
        TableName: process.env.MEME_DATABASE_TABLE_NAME!,
        Item: meme,
    };

    try {
        const response = await dbClient.send(new PutCommand(params));

        console.log('Response: ', response);

        return response;
    } catch (error) {
        console.log('Error while updating meme: ', error);

        return null;
    }
};
