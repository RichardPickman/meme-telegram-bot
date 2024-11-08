import { Message, Update } from 'node-telegram-bot-api';
import {
    isForwardedMessage,
    isMessage,
    isPhotoParameterExist,
    isVideoParameterExist,
} from '../utils/booleans';
import { ErrorResponse, SUCCESSFUL_RESPONSE } from '../utils/responses';
import { sendPhotoToChannel, sendVideoToChannel } from '../utils/senders';

type Body = Update;

const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;

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

export const proceedWithMemeProposal = async (body: Body) => {
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
