import { Message, Update } from 'node-telegram-bot-api';
import { bot } from '../instances/bot';
import {
    sendDocumentToChannel,
    sendMessage,
    sendPhotoToChannel,
    sendProposedMemeControls,
    sendVideoToChannel,
} from '../senders';
import {
    isDocumentParameterExist,
    isForwardedMessage,
    isMediaGroupParameterExist,
    isMessage,
    isPhotoParameterExist,
    isVideoParameterExist,
} from '../utils/booleans';
import { getMediaDataFromMessage } from '../utils/helpers';
import { ErrorResponse, SuccessfullResponse } from '../utils/responses';
import { getMessageId, saveGroupData } from './saveMediaGroup';

const feedbackMessage =
    'Thanks for your contribution. We will review it as soon as possible.';

const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;

const handlePostedMediaGroup = async (
    savedMessageId: number,
    data: Message,
) => {
    console.log('Message id found: ', savedMessageId);

    try {
        const mediaData = getMediaDataFromMessage(data);

        if (!mediaData) {
            console.log('No media id provided');

            return ErrorResponse('No media id provided');
        }

        await bot.editMessageMedia(mediaData, {
            message_id: savedMessageId,
            chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
        });

        return SuccessfullResponse();
    } catch (error) {
        console.log('Error editing message media: ', error);

        return ErrorResponse('Error editing message media');
    }
};

const handleNewMediaGroup = async (data: Message) => {
    console.log('No message id found. Proceeding with saving message media...');

    const mediaGroupId = data.media_group_id;

    if (!mediaGroupId) {
        console.log('No media group id provided');

        return ErrorResponse('No media group id provided');
    }

    if (data.photo) {
        const message = await sendPhotoToChannel(
            data,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        if (!message) {
            console.log('Error sending photo');

            return ErrorResponse('Error sending photo');
        }

        const response = await saveGroupData(mediaGroupId, message.message_id);

        if (!response) {
            console.log('Error saving media group data');

            return ErrorResponse('Error saving media group data');
        }

        await sendProposedMemeControls(
            message.message_id,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        console.log('Media group data saved. Response: ', response);

        return SuccessfullResponse();
    }

    if (data.video) {
        const message = await sendVideoToChannel(
            data,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        if (!message) {
            console.log('Error sending video');

            return ErrorResponse('Error sending video');
        }

        const response = await saveGroupData(mediaGroupId, message.message_id);

        if (!response) {
            console.log('Error saving media group data');

            return ErrorResponse('Error saving media group data');
        }

        console.log('Media group data saved. Response: ', response);

        await sendProposedMemeControls(
            message.message_id,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        return SuccessfullResponse();
    }

    return SuccessfullResponse();
};

const handleMediaGroup = async (data: Message) => {
    console.log('Media group found. Proceeding with media...');

    const mediaGroupId = data.media_group_id;

    if (!mediaGroupId) {
        console.log('No media group id provided');

        return ErrorResponse('No media group id provided');
    }

    const savedMessageId = await getMessageId(mediaGroupId);

    if (savedMessageId) {
        return await handlePostedMediaGroup(savedMessageId, data);
    }

    if (!savedMessageId) {
        return await handleNewMediaGroup(data);
    }

    return SuccessfullResponse();
};

const handleProposal = async (data: Message) => {
    if (isMediaGroupParameterExist(data)) {
        console.log('Media group parameter found. Proceeding with media...');

        return await handleMediaGroup(data);
    }

    if (isPhotoParameterExist(data)) {
        const message = await sendPhotoToChannel(
            data,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        await sendMessage(feedbackMessage, data.chat.id);

        return SuccessfullResponse();
    }

    if (isVideoParameterExist(data)) {
        const message = await sendVideoToChannel(
            data,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        await sendMessage(feedbackMessage, data.chat.id);

        return SuccessfullResponse();
    }

    if (isDocumentParameterExist(data)) {
        const message = await sendDocumentToChannel(
            data,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
        );

        await sendMessage(feedbackMessage, data.chat.id);

        return SuccessfullResponse();
    }

    console.log('Proposal handler finished... No suitable action found.');

    return ErrorResponse('Data format is invalid.');
};

export const proceedWithMemeProposal = async (body: Update) => {
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

    return SuccessfullResponse();
};
