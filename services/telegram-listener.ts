import { APIGatewayProxyEvent } from 'aws-lambda';
import TelegramBot, {
    CallbackQuery,
    Message,
    Update,
} from 'node-telegram-bot-api';

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

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);

type Body = Update;

const sendProposedMemeControls = async (messageId: number) => {
    console.log(`Proceeding with action buttons...`);

    try {
        await bot.sendMessage(TELEGRAM_PROPOSAL_CHANNEL_ID!, '🧐', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Approve',
                            callback_data: `approve-${messageId}`,
                        },
                    ],
                    [
                        {
                            text: 'Decline',
                            callback_data: `decline-${messageId}`,
                        },
                    ],
                ],
            },
        });

        console.log('Buttons sent. Finishing up...');

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending buttons: ', e);

        return ErrorResponse('Error sending buttons');
    }
};

const sendPhotoToChannel = async (
    photoId: string,
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendPhoto(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            photoId,
            {
                caption,
            },
        );

        console.log('Photo sent. Photo data: ', JSON.stringify(message));

        if (isProposal) {
            await sendProposedMemeControls(message.message_id);
        }

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

const sendVideoToChannel = async (
    videoId: string,
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendVideo(
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            videoId,
            {
                caption,
            },
        );

        if (isProposal) {
            await sendProposedMemeControls(message.message_id);
        }

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

const isPhotoParameterExist = (data: Message) => 'photo' in data;
const isVideoParameterExist = (data: Message) => 'video' in data;

const isForwardedMessage = (body: Body) => 'channel_post' in body;
const isMessage = (body: Body) => 'message' in body;

const ErrorResponse = (message: string) => ({
    statusCode: 200,
    body: JSON.stringify({ message }),
});

const SUCCESSFUL_RESPONSE = {
    statusCode: 200,
};

const handleMessage = async (data: Message) => {
    console.log(data);

    if (isPhotoParameterExist(data)) {
        const photo = data.photo?.at(-1);

        if (!photo) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        const photoId = photo.file_id;

        await sendPhotoToChannel(photoId, data.caption);

        return SUCCESSFUL_RESPONSE;
    }

    if (isVideoParameterExist(data)) {
        const video = data.video;

        if (!video) {
            console.log('No video provided');

            return ErrorResponse('No video provided');
        }

        await sendVideoToChannel(video.file_id, data.caption);

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

const isMessageContainImageOrVideo = (body: Body) =>
    [isForwardedMessage(body), isMessage(body)].some(Boolean);

const isMessageIsCallbackQuery = (body: Body) => 'callback_query' in body;

const proceedWithMedia = async (body: Body) => {
    console.log('Proceeding with media...');

    const isForwarded = isForwardedMessage(body);

    if (isForwarded) {
        const channelPost = body.channel_post;

        if (!channelPost) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        return await handleMessage(channelPost);
    }

    const isCommonMessage = isMessage(body);

    if (isCommonMessage) {
        const message = body.message;

        if (!message) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        return await handleMessage(message);
    }

    return SUCCESSFUL_RESPONSE;
};

const cleanUpAfterAction = async (memeId: string, controlsId: number) => {
    console.log('Cleaning up after action...');

    try {
        await bot.deleteMessage(TELEGRAM_PROPOSAL_CHANNEL_ID!, Number(memeId));

        await bot.deleteMessage(TELEGRAM_PROPOSAL_CHANNEL_ID!, controlsId);

        return;
    } catch (e) {
        console.log('Error cleaning up after action. Error: ', e);

        return ErrorResponse('Error cleaning up after action');
    }
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
            messageId,
            body.callback_query.message.message_id,
        );

        return SUCCESSFUL_RESPONSE;
    }

    return SUCCESSFUL_RESPONSE;
};

const isMessageContainPrivateChatType = (message: Message | undefined) => {
    const chat = message?.chat ?? undefined;

    if (chat && chat.type === 'private') {
        return true;
    }

    return false;
};

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

        return await proceedWithMedia(body);
    }

    const isAdminAction = isMessageIsCallbackQuery(body);

    if (isAdminAction) {
        return await proceedWithAdminAction(body);
    }

    return SUCCESSFUL_RESPONSE;
};
