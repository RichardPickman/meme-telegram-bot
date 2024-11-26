import { bot } from './instances/bot';
import { getFirstUnpublishedMeme, updateMeme } from './utils/database';

const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;

export const handler = async () => {
    const meme = await getFirstUnpublishedMeme(
        process.env.MEME_DATABASE_TABLE_NAME!,
    );

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
