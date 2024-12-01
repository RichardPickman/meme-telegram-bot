import { Update } from 'node-telegram-bot-api';
import { setReactionToPost } from '../senders';
import { ErrorResponse } from '../utils/responses';

export const proceedWithChannelAction = async (data: Update) => {
    console.log('Proceeding with channel action...');

    const channel_post = data.channel_post;

    if (!channel_post) {
        console.log('No message provided');

        return ErrorResponse('No message provided');
    }

    const chatId = channel_post.chat.id;

    if (!chatId) {
        console.log('No chat id provided');

        return ErrorResponse('No chat id provided');
    }

    return await setReactionToPost(channel_post.message_id, chatId);
};
