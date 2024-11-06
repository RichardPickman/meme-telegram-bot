import dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_PROPOSAL_CHANNEL_ID =
    process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
export const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;

export const TESTING_BOT_TOKEN = process.env.TESTING_BOT_TOKEN;
export const TESTING_PROPOSAL_CHANNEL_ID =
    process.env.TESTING_PROPOSAL_CHANNEL_ID;
export const TESTING_MEME_CHANNEL_ID = process.env.TESTING_MEME_CHANNEL_ID;
