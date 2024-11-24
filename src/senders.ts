import { bot } from './instances/bot';
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
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendPhoto(channelId, photoId, {
            caption,
        });

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
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendVideo(channelId, videoId, {
            caption,
        });

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
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendDocument(channelId, documentId, {
            caption,
        });

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
        const message = await bot.sendMessage(chatId, text);

        return SuccessfullResponse();
    } catch (e) {
        console.log('Error sending feedback. Error: ', e);

        return ErrorResponse('Error sending feedback');
    }
};
