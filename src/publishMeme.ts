import { Meme } from '../types';
import { bot } from './instances/bot';
import { getCurrentTimeFrameMeme, updateMeme } from './utils/database';

const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;
const MEME_DATABASE_TABLE_NAME = process.env.MEME_DATABASE_TABLE_NAME;

const ENV_VARS = [
    TELEGRAM_PROPOSAL_CHANNEL_ID,
    TELEGRAM_MEME_CHANNEL_ID,
    MEME_DATABASE_TABLE_NAME,
];

if (!ENV_VARS.every((envVar) => envVar)) {
    throw new Error('One or more env vars are missing');
}

export const handler = async () => {
    const meme = (await getCurrentTimeFrameMeme(
        MEME_DATABASE_TABLE_NAME!,
    )) as Meme | null;

    if (!meme) {
        console.log('No meme to publish');

        return {
            statusCode: 200,
        };
    }

    const message = await bot.forwardMessage(
        TELEGRAM_MEME_CHANNEL_ID!,
        TELEGRAM_PROPOSAL_CHANNEL_ID!,
        Number(meme.messageId),
    );

    if (!message) {
        console.log('No message provided');

        return {
            statusCode: 200,
        };
    }

    await updateMeme({ ...meme, isPublished: true });

    return {
        statusCode: 200,
    };
};
