import { Update } from 'node-telegram-bot-api';
import { setReactionToPost } from '../senders';
import { ErrorResponse } from '../utils/responses';

export const proceedWithChannelAction = async (data: Update) => {
    console.log('Proceeding with channel action...');

    const message = data.message;

    if (!message) {
        console.log('No message provided');

        return ErrorResponse('No message provided');
    }

    const chatId = message.chat.id;

    if (!chatId) {
        console.log('No chat id provided');

        return ErrorResponse('No chat id provided');
    }

    return await setReactionToPost(message.message_id, chatId);
};
