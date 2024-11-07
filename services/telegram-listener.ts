import { APIGatewayProxyEvent } from 'aws-lambda';
import { CallbackQuery, Message, Update } from 'node-telegram-bot-api';
import { bot } from './instanses';
import {
    isForwardedMessage,
    isMessage,
    isMessageContainImageOrVideo,
    isMessageContainPrivateChatType,
    isMessageIsCallbackQuery,
    isPhotoParameterExist,
    isVideoParameterExist,
} from './utils/booleans';
import { cleanUpAfterAction } from './utils/cleanUp';
import { ErrorResponse, SUCCESSFUL_RESPONSE } from './utils/responses';
import { sendPhotoToChannel, sendVideoToChannel } from './utils/senders';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;

const ENV_VARS = [
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
    TELEGRAM_MEME_CHANNEL_ID,
];

if (!ENV_VARS.every(Boolean)) {
    throw new Error('One or more environmental variables are not set');
}

type Body = Update;

const handleProposal = async (data: Message) => {
    if (isPhotoParameterExist(data)) {
        const photo = data.photo?.at(-1);

        if (!photo) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        const photoId = photo.file_id;

        await sendPhotoToChannel(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            photoId,
            data.caption,
        );

        return SUCCESSFUL_RESPONSE;
    }

    if (isVideoParameterExist(data)) {
        const video = data.video;

        if (!video) {
            console.log('No video provided');

            return ErrorResponse('No video provided');
        }

        await sendVideoToChannel(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            video.file_id,
            data.caption,
        );

        return SUCCESSFUL_RESPONSE;
    }

    console.log('Data format is invalid.');

    return ErrorResponse('Data format is invalid.');
};

const isAdmin = async (id: number) => {
    const admins = await bot.getChatAdministrators(
        TELEGRAM_PROPOSAL_CHANNEL_ID!,
    );

    const hasAdmin = admins.find((admin) => admin.user.id === id);

    return Boolean(hasAdmin);
};

const getBodyOrNull = (event: APIGatewayProxyEvent) =>
    event.body ? JSON.parse(event.body) : null;

const proceedWithMemeProposal = async (body: Body) => {
    console.log('Proceeding with media...');

    const isForwarded = isForwardedMessage(body);

    if (isForwarded) {
        const channelPost = body.channel_post;

        if (!channelPost) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        return await handleProposal(channelPost);
    }

    const isDirectMessage = isMessage(body);

    if (isDirectMessage) {
        const message = body.message;

        if (!message) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        return await handleProposal(message);
    }

    return SUCCESSFUL_RESPONSE;
};

const proceedWithAdminAction = async (
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

/*
    Main handler, that recieves api requests from API Gateway

    @param message - Message object from Telegram Message interface

    @returns boolean
*/
export const handler = async (event: APIGatewayProxyEvent) => {
    console.log('Starting handler...');

    const body = getBodyOrNull(event);

    console.log('This is BODY: ', body);

    if (!body) {
        console.log('Invalid event');

        return ErrorResponse('Invalid event');
    }

    // Check chat type presence
    const isMemeProposal = isMessageContainPrivateChatType(body.message);
    const hasMedia = isMessageContainImageOrVideo(body);

    if (isMemeProposal && hasMedia) {
        console.log(
            'Request is determined as meme proposal... Proceeding with media...',
        );

        return await proceedWithMemeProposal(body).then(() =>
            bot.sendMessage(
                body.message.chat.id,
                'Your proposal has been sent to the meme-bot team. We will review it. Thank you for your contribution!',
            ),
        );
    }

    const isAdminAction = isMessageIsCallbackQuery(body);

    if (isAdminAction) {
        return await proceedWithAdminAction(body);
    }

    return SUCCESSFUL_RESPONSE;
};
