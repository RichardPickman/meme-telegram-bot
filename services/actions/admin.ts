import { CallbackQuery } from 'node-telegram-bot-api';
import { bot } from '../instanses';
import { cleanUpAfterAction } from '../utils/cleanUp';
import { ErrorResponse, SUCCESSFUL_RESPONSE } from '../utils/responses';

const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;

const isAdmin = async (id: number) => {
    const admins = await bot.getChatAdministrators(
        TELEGRAM_PROPOSAL_CHANNEL_ID!,
    );

    const hasAdmin = admins.find((admin) => admin.user.id === id);

    return Boolean(hasAdmin);
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

    const isAllowedToProceed = await isAdmin(body.callback_query.from.id);

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

    if (action === 'approve') {
        await bot.forwardMessage(
            TELEGRAM_MEME_CHANNEL_ID!,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            Number(messageId),
        );

        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'Meme sent 🎉',
        });

        if (!body.callback_query.message?.message_id) {
            console.log('No message id provided');

            return ErrorResponse('No message id provided');
        }

        await cleanUpAfterAction(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            messageId,
            body.callback_query.message.message_id,
        );

        return SUCCESSFUL_RESPONSE;
    }

    if (!body.callback_query.message?.message_id) {
        console.log('No message id provided');

        return ErrorResponse('No message id provided');
    }

    if (action === 'decline') {
        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'Got you boss, I will not send this one 🫡',
        });

        await cleanUpAfterAction(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            messageId,
            body.callback_query.message.message_id,
        );

        return SUCCESSFUL_RESPONSE;
    }

    return SUCCESSFUL_RESPONSE;
};
