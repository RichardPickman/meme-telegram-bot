import { Message, Update } from 'node-telegram-bot-api';
import { TELEGRAM_PROPOSAL_CHANNEL_ID } from '../../lib/environments';
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
import { ErrorResponse, SuccessfullResponse } from '../utils/responses';
import { getMessageId, saveGroupData } from './saveMediaGroup';

const feedbackMessage =
    'Thanks for your contribution. We will review it as soon as possible.';

type MediaDataOutput = {
    type: 'photo' | 'video';
    media: string;
};

const getMediaDataFromMessage = (message: Message): MediaDataOutput | null => {
    if (message.photo) {
        const photo = message.photo.at(-1);

        if (!photo) {
            return null;
        }

        return {
            type: 'photo',
            media: photo.file_id,
        };
    }

    if (message.video) {
        return {
            type: 'video',
            media: message.video?.file_id,
        };
    }

    return null;
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
        console.log('Message id found: ', savedMessageId);

        const mediaData = getMediaDataFromMessage(data);

        if (!mediaData) {
            console.log('No media id provided');

            return ErrorResponse('No media id provided');
        }

        const updatedMessage = await bot.editMessageMedia(mediaData, {
            message_id: savedMessageId,
            chat_id: TELEGRAM_PROPOSAL_CHANNEL_ID!,
        });

        return updatedMessage;
    }

    if (!savedMessageId) {
        console.log(
            'No message id found. Proceeding with saving message media...',
        );

        let message: Message | null;

        if (data.photo) {
            const photo = data.photo?.at(-1);

            if (!photo) {
                console.log('No photo provided');

                return ErrorResponse('No photo provided');
            }

            message = await sendPhotoToChannel(
                photo.file_id,
                TELEGRAM_PROPOSAL_CHANNEL_ID!,
                data.caption,
                false,
            );

            if (!message) {
                console.log('Error sending photo');

                return ErrorResponse('Error sending photo');
            }

            const response = await saveGroupData(
                mediaGroupId,
                message.message_id,
            );

            if (!response) {
                console.log('Error saving media group data');

                return ErrorResponse('Error saving media group data');
            }

            await sendProposedMemeControls(
                message.message_id,
                String(data.chat.id),
            );

            console.log('Media group data saved. Response: ', response);
        }

        if (data.video) {
            const video = data.video;

            if (!video) {
                console.log('No video provided');

                return ErrorResponse('No video provided');
            }

            message = await sendVideoToChannel(
                video.file_id,
                TELEGRAM_PROPOSAL_CHANNEL_ID!,
                data.caption,
                false,
            );

            if (!message) {
                console.log('Error sending video');

                return ErrorResponse('Error sending video');
            }

            const response = await saveGroupData(
                mediaGroupId,
                message.message_id,
            );

            if (!response) {
                console.log('Error saving media group data');

                return ErrorResponse('Error saving media group data');
            }

            console.log('Media group data saved. Response: ', response);
        }
    }

    return SuccessfullResponse();
};

const handleProposal = async (data: Message) => {
    if (isMediaGroupParameterExist(data)) {
        console.log('Media group parameter found. Proceeding with media...');

        return await handleMediaGroup(data);
    }

    if (isPhotoParameterExist(data)) {
        const photo = data.photo?.at(-1);

        if (!photo) {
            console.log('No photo provided');

            return ErrorResponse('No photo provided');
        }

        const photoId = photo.file_id;

        await sendPhotoToChannel(
            photoId,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            data.caption,
        );

        await sendMessage(feedbackMessage, data.chat.id);

        return SuccessfullResponse();
    }

    if (isVideoParameterExist(data)) {
        const video = data.video;

        if (!video) {
            console.log('No video provided');

            return ErrorResponse('No video provided');
        }

        await sendVideoToChannel(
            video.file_id,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            data.caption,
        );

        await sendMessage(feedbackMessage, data.chat.id);

        return SuccessfullResponse();
    }

    if (isDocumentParameterExist(data)) {
        const document = data.document;

        if (!document) {
            console.log('No document provided');

            return ErrorResponse('No document provided');
        }

        await sendDocumentToChannel(
            document.file_id,
            TELEGRAM_PROPOSAL_CHANNEL_ID!,
            data.caption,
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
