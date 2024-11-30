import { CallbackQuery } from 'node-telegram-bot-api';
import { TELEGRAM_PROPOSAL_CHANNEL_ID } from '../../lib/environments';
import { bot } from '../instances/bot';
import { isAdmin } from '../utils/booleans';
import { getLatestSavedMeme, saveMeme } from '../utils/database';
import { ErrorResponse, SuccessfullResponse } from '../utils/responses';

const cleanUpAfterAction = async (controlsId: number, caption: string) => {
    console.log('Cleaning up after action...');

    try {
        await bot.editMessageCaption(caption, {
            chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
            message_id: controlsId,
        });

        await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
                message_id: controlsId,
            },
        );

        return;
    } catch (e) {
        console.log('Error cleaning up after action. Error: ', e);

        return ErrorResponse('Error cleaning up after action');
    }
};

const isTimePassed = (publishTime: Date | undefined) => {
    const currentTime = new Date();

    if (!publishTime) {
        return true;
    }

    return currentTime.getTime() > publishTime.getTime();
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

    if (action === 'approve') {
        console.log('Action is approved. Proceeding with sending...');

        const lastMeme = await getLatestSavedMeme(
            process.env.MEME_DATABASE_TABLE_NAME!,
        );

        console.log('Last meme: ', lastMeme);

        let publishTime = lastMeme?.publishTime;
        const isTimeFrameExpired = isTimePassed(publishTime);

        if (!publishTime || isTimeFrameExpired) {
            console.log(
                'No publishTime found. No meme present. Creating new timeframe for meme.',
            );

            publishTime = new Date();
        }

        const newMeme = await saveMeme(messageId, publishTime);

        if (!newMeme) {
            console.log('No message provided');

            return ErrorResponse('No message provided');
        }

        await bot.answerCallbackQuery(body.callback_query.id, {
            text: 'Meme saved.',
        });

        if (!body.callback_query.message?.message_id) {
            console.log('No message id provided');

            return ErrorResponse('No message id provided');
        }

        const saintPeterTime = new Date(newMeme.publishTime).setUTCHours(
            newMeme.publishTime.getUTCHours() + 3,
        );

        await cleanUpAfterAction(
            body.callback_query.message.message_id,
            `Meme saved. Time of publishing: ${saintPeterTime}`,
        );

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

        await cleanUpAfterAction(
            body.callback_query.message.message_id,
            'Declined',
        );

        return SuccessfullResponse();
    }

    return SuccessfullResponse();
};
