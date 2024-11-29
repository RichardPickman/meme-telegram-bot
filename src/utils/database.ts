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
    const release = new Date();

    release.setSeconds(0);
    release.setMilliseconds(0);

    return release;
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
    const release = getCurrentTimeFrame();

    const params: QueryCommandInput = {
        TableName,
        FilterExpression: 'release = :release',
        ExpressionAttributeValues: marshall({
            ':release': release.toISOString(),
        }),
        Limit: 1,
    };

    const meme = await queryDatabase(params);

    if (!meme) {
        return null;
    }

    return meme;
};

export const getLatestSavedMeme = async (TableName: string) => {
    console.log('Getting latest saved meme...');

    const params: QueryCommandInput = {
        TableName,
        ScanIndexForward: false,
        Limit: 1,
    };

    const meme = (await scanDatabase(params)) as Meme | null;

    if (!meme) {
        return null;
    }

    return { ...meme, release: new Date(meme.release) };
};

const getClosestTimeFrame = (release: Date) => {
    const isPastMid = release.getMinutes() >= 30;

    if (isPastMid) {
        const currentHour = release.getHours();

        release.setHours(currentHour + 1);
        release.setMinutes(0);
        release.setSeconds(0);
        release.setMilliseconds(0);

        return release;
    }

    if (!isPastMid) {
        release.setMinutes(30);
        release.setSeconds(0);
        release.setMilliseconds(0);

        return release;
    }

    return release;
};

const constructMeme = (messageId: string, release: Date): Meme => ({
    id: randomUUID(),
    messageId,
    isPublished: false,
    release: getClosestTimeFrame(release),
    createdAt: Date.now(),
});

export const saveMeme = async (messageId: string, release: Date) => {
    console.log('Saving meme...');

    const meme = constructMeme(messageId, release);

    const params: PutCommandInput = {
        TableName: process.env.MEME_DATABASE_TABLE_NAME!,
        Item: { ...meme, release: new Date(meme.release).toISOString() },
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
