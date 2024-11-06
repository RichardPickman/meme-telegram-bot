import { SendMessageOptions } from 'node-telegram-bot-api';
import { bot } from '../instanses';
import { ErrorResponse, SUCCESSFUL_RESPONSE } from './responses';

export const sendProposedMemeControls = async (
    channelId: string,
    messageId: number,
) => {
    console.log(`Proceeding with action buttons...`);

    const options: SendMessageOptions = {
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
    };

    try {
        await bot.sendMessage(channelId, '🧐', options);

        console.log('Buttons sent. Finishing up...');

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending buttons: ', e);

        return ErrorResponse('Error sending buttons');
    }
};

export const sendPhotoToChannel = async (
    channelId: string,
    photoId: string,
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendPhoto(channelId, photoId, {
            caption,
        });

        console.log('Photo sent. Photo data: ', JSON.stringify(message));

        if (isProposal) {
            await sendProposedMemeControls(channelId, message.message_id);
        }

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};

export const sendVideoToChannel = async (
    channelId: string,
    videoId: string,
    caption: string = '',
    isProposal: boolean = true,
) => {
    try {
        const message = await bot.sendVideo(channelId, videoId, {
            caption,
        });

        if (isProposal) {
            await sendProposedMemeControls(channelId, message.message_id);
        }

        return SUCCESSFUL_RESPONSE;
    } catch (e) {
        console.log('Error sending photo: ', e);

        return ErrorResponse('Error sending photo');
    }
};
