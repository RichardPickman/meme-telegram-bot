import { Message, Update } from 'node-telegram-bot-api';
import { TELEGRAM_PROPOSAL_CHANNEL_ID } from '../../lib/environments';
import {
    sendDocumentToChannel,
    sendMessage,
    sendPhotoToChannel,
    sendVideoToChannel,
} from '../senders';
import {
    isDocumentParameterExist,
    isForwardedMessage,
    isMessage,
    isPhotoParameterExist,
    isVideoParameterExist,
} from '../utils/booleans';
import { ErrorResponse, SuccessfullResponse } from '../utils/responses';

const feedbackMessage =
    'Thanks for your contribution. We will review it as soon as possible.';

const handleProposal = async (data: Message) => {
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
