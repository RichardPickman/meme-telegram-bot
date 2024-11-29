import { QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
    PutCommand,
    PutCommandInput,
    QueryCommandInput,
    ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { inspect } from 'util';
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

        return result as unknown as Meme;
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
            data,
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

        return result;
    } catch (error) {
        console.error('Error: ', error);

        return null;
    }
};

export const getCurrentTimeFrameMeme = async (TableName: string) => {
    const time = getCurrentTimeFrame();

    const params: QueryCommandInput = {
        TableName,
        FilterExpression: 'time = :time',
        ExpressionAttributeValues: marshall({
            ':time': time.toISOString(),
        }),
        Limit: 1,
    };

    return await queryDatabase(params);
};

export const getLatestSavedMeme = async (TableName: string) => {
    console.log('Getting latest saved meme...');
    const params: QueryCommandInput = {
        TableName,
        ScanIndexForward: false,
        Limit: 1,
    };

    const item = (await scanDatabase(params)) as unknown as Meme;

    return { ...item, time: new Date(item.time) };
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
        await dbClient.send(new PutCommand(params));

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
