import { CallbackQuery } from 'node-telegram-bot-api';
import {
    TELEGRAM_MEME_CHANNEL_ID,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
} from '../../lib/environments';
import { bot } from '../instances/bot';
import { setReactionToPost } from '../senders';
import { isAdmin } from '../utils/booleans';
import { ErrorResponse, SuccessfullResponse } from '../utils/responses';

const cleanUpAfterAction = async (
    memeId: number,
    caption: 'Approved' | 'Declined',
) => {
    console.log('Cleaning up after action...');

    try {
        await bot.editMessageCaption(caption, {
            chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
            message_id: memeId,
        });

        await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
                message_id: memeId,
            },
        );

        return;
    } catch (e) {
        console.log('Error cleaning up after action. Error: ', e);

        return ErrorResponse('Error cleaning up after action');
    }
};

export const proceedWithAdminAction = async (
    body: Body & { callback_query: CallbackQuery },
) => {
    console.log('Proceeding with admin action...');

    const data = body.callback_query.data;

    if (!data) {
        console.log('No data provided');

        return ErrorResponse('No data provided');
    }

    const [action, messageId] = data.split('-') as [
        'approve' | 'decline',
        string,
    ];

    const isAllowedToProceed = await isAdmin(
        body.callback_query.from.id,
        TELEGRAM_PROPOSAL_CHANNEL_ID!,
    );

    if (!isAllowedToProceed) {
        console.log('User is not allowed to proceed');

        if (!body.callback_query.message?.chat.id) {
            console.log('No chat id provided');

            return ErrorResponse('No chat id provided');
        }

        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'You are not allowed to proceed 🖕🏻',
        });

        return ErrorResponse('User is not allowed to proceed');
    }

    if (!body.callback_query.message?.message_id) {
        console.log('No message id provided');

        return ErrorResponse('No message id provided');
    }

    if (action === 'approve') {
        console.log('Action is approved. Proceeding with sending...');

        const message = await bot.copyMessage(
            TELEGRAM_MEME_CHANNEL_ID!,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            Number(body.callback_query.message.message_id),
            {
                reply_markup: {
                    inline_keyboard: [],
                },
            },
        );

        if (!message) {
            console.log('No message posted');

            return ErrorResponse('No message posted');
        }

        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'Meme sent 🎉',
        });

        await setReactionToPost(
            Number(message.message_id),
            TELEGRAM_MEME_CHANNEL_ID!,
        );

        if (!body.callback_query.message?.message_id) {
            console.log('No message id provided');

            return ErrorResponse('No message id provided');
        }

        await cleanUpAfterAction(Number(messageId), 'Approved');

        return SuccessfullResponse();
    }

    if (!body.callback_query.message?.message_id) {
        console.log('No message id provided');

        return ErrorResponse('No message id provided');
    }

    if (action === 'decline') {
        console.log('Action is approved. Proceeding with sending...');

        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'Got you boss, I will not send this one 🫡',
        });

        await cleanUpAfterAction(Number(messageId), 'Declined');

        return SuccessfullResponse();
    }

    return SuccessfullResponse();
};
