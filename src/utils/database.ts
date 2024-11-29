import { QueryCommand } from '@aws-sdk/client-dynamodb';
import {
    PutCommand,
    PutCommandInput,
    QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { dbClient } from '../instances/db';

type Meme = {
    id: string;
    isPublished: boolean;
    time: Date;
    messageId: string;
    createdAt: number;
};

const getCurrentTimeFrame = () => {
    const time = new Date();

    time.setSeconds(0);
    time.setMilliseconds(0);

    return time;
};

export const getCurrentTimeFrameMeme = async (TableName: string) => {
    const time = getCurrentTimeFrame();

    const params: QueryCommandInput = {
        TableName,
        FilterExpression: 'time = :time',
        ExpressionAttributeValues: {
            ':time': time.toISOString(),
        },
        Limit: 1,
    };

    try {
        const data = await dbClient.send(new QueryCommand(params));

        if (!data.Items) {
            return null;
        }

        console.log(data);

        const result = unmarshall(data.Items[0]);

        return result as Meme;
    } catch (error) {
        console.log('Error: ', error);
        return null;
    }
};

export const getLatestSavedMeme = async (TableName: string) => {
    console.log('Getting latest saved meme...');

    const params: QueryCommandInput = {
        TableName,
        IndexName: 'createdAt',
        KeyConditionExpression: 'createdAt = :createdAt',
        ExpressionAttributeValues: marshall({ ':createdAt': Date.now() }),
        ScanIndexForward: false,
        Limit: 1,
    };

    try {
        const data = await dbClient.send(new QueryCommand(params));

        if (!data.Items) {
            return null;
        }

        console.log(data.Items);

        const result = unmarshall(data.Items[0]);

        return result as Meme;
    } catch (error) {
        console.log('Error: ', error);

        return null;
    }
};

const getClosestTimeFrame = (time: Date) => {
    const isPastMid = time.getMinutes() > 30;

    if (isPastMid) {
        const currentHour = time.getHours();

        time.setHours(currentHour + 1);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);

        return time;
    }

    if (!isPastMid) {
        time.setMinutes(30);
        time.setSeconds(0);
        time.setMilliseconds(0);

        return time;
    }

    return time;
};

const constructMeme = (messageId: string, time: Date): Meme => ({
    id: randomUUID(),
    messageId,
    isPublished: false,
    time: getClosestTimeFrame(time),
    createdAt: Date.now(),
});

export const saveMeme = async (messageId: string, time: Date) => {
    const meme = constructMeme(messageId, time);

    const params: PutCommandInput = {
        TableName: process.env.MEME_DATABASE_TABLE_NAME!,
        Item: { ...meme, time: new Date(meme.time).toISOString() },
    };

    try {
        const response = await dbClient.send(new PutCommand(params));

        console.log('Response: ', response);

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
