import {
    SendDocumentOptions,
    SendPhotoOptions,
    SendVideoOptions,
} from 'node-telegram-bot-api';
import { bot } from './instances/bot';
import { getRandomEmoji } from './utils/helpers';
import { ErrorResponse, SuccessfullResponse } from './utils/responses';

export const sendProposedMemeControls = async (
    messageId: number,
    channelId: string,
) => {
    console.log(`Proceeding with action buttons...`);

    try {
        await bot.sendMessage(channelId, '🧐', {
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

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending buttons: ', e);

        return ErrorResponse('Error sending buttons');
    }
};

export const sendPhotoToChannel = async (
    photoId: string,
    channelId: string,
    options: SendPhotoOptions,
    isProposal: boolean = false,
) => {
    try {
        const message = await bot.sendPhoto(channelId, photoId, options);

        console.log('Photo sent. Photo data: ', JSON.stringify(message));

        if (isProposal) {
            await sendProposedMemeControls(message.message_id, channelId);
        }

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

export const sendVideoToChannel = async (
    videoId: string,
    channelId: string,
    options: SendVideoOptions,
    isProposal: boolean = false,
) => {
    try {
        const message = await bot.sendVideo(channelId, videoId, options);

        if (isProposal) {
            await sendProposedMemeControls(message.message_id, channelId);
        }

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

export const sendDocumentToChannel = async (
    documentId: string,
    channelId: string,
    options: SendDocumentOptions,
    isProposal: boolean = false,
) => {
    try {
        const message = await bot.sendDocument(channelId, documentId, options);

        if (isProposal) {
            await sendProposedMemeControls(message.message_id, channelId);
        }

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

export const sendMessage = async (text: string, chatId: number) => {
    console.log('Sending feedback...');

    try {
        await bot.sendMessage(chatId, text);

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending feedback. Error: ', e);

        return ErrorResponse('Error sending feedback');
    }
};

export const setReactionToPost = async (
    messageId: number,
    channelId: number | string,
) => {
    console.log('Sending reaction...');

    try {
        // @ts-expect-error - setMessageReaction is not in the type definition, but it is presented. TODO: remove ts-error when it is fixed
        await bot.setMessageReaction(channelId, messageId, {
            reaction: [
                {
                    type: 'emoji',
                    emoji: getRandomEmoji(),
                },
            ],
        });

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending feedback. Error: ', e);

        return ErrorResponse('Error sending feedback');
    }
};
