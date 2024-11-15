import { Message } from 'node-telegram-bot-api';
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

// export const sendPhotoToChannel = async (
//     photoId: string,
//     channelId: string,
//     caption: string = '',
//     isProposal: boolean = true,
// ) => {
//     try {
//         const message = await bot.sendPhoto(channelId, photoId, {
//             caption,
//         });

//         console.log('Photo sent. Photo data: ', JSON.stringify(message));

//         if (isProposal) {
//             await sendProposedMemeControls(message.message_id, channelId);
//         }

//         return message;
//     } catch (e) {
//         console.log('Error sending photo: ', e);

//         return null;
//     }
// };

// export const sendVideoToChannel = async (
//     videoId: string,
//     channelId: string,
//     caption: string = '',
//     isProposal: boolean = true,
// ) => {
//     try {
//         const message = await bot.sendVideo(channelId, videoId, {
//             caption,
//         });

//         if (isProposal) {
//             await sendProposedMemeControls(message.message_id, channelId);
//         }

//         return message;
//     } catch (e) {
//         console.log('Error sending photo: ', e);

//         return null;
//     }
// };

// export const sendDocumentToChannel = async (
//     documentId: string,
//     channelId: string,
//     caption: string = '',
//     isProposal: boolean = true,
// ) => {
//     try {
//         const message = await bot.sendDocument(channelId, documentId, {
//             caption,
//         });

//         if (isProposal) {
//             await sendProposedMemeControls(message.message_id, channelId);
//         }

//         return message;
//     } catch (e) {
//         console.log('Error sending photo: ', e);

//         return null;
//     }
// };

export const sendMessage = async (text: string, chatId: number) => {
    console.log('Sending feedback...');

    try {
        const message = await bot.sendMessage(chatId, text);

        return message;
    } catch (e) {
        console.log('Error sending feedback. Error: ', e);

        return ErrorResponse('Error sending feedback');
    }
};

export const sendPhotoToChannel = async (data: Message, channelId: string) => {
    const photo = data.photo?.at(-1);

    if (!photo) {
        console.log('No photo provided');

        return null;
    }

    const photoId = photo.file_id;

    try {
        const message = await bot.sendPhoto(channelId, photoId, {
            caption: data.caption,
        });

        return message;
    } catch (e) {
        console.log('Error sending photo: ', e);

        return null;
    }
};

export const sendVideoToChannel = async (data: Message, channelId: string) => {
    const video = data.video;

    if (!video) {
        console.log('No video provided');

        return null;
    }

    const videoId = video.file_id;

    try {
        const message = await bot.sendVideo(channelId, videoId, {
            caption: data.caption,
        });

        return message;
    } catch (e) {
        console.log('Error sending video: ', e);

        return null;
    }
};

export const sendDocumentToChannel = async (
    data: Message,
    channelId: string,
) => {
    const document = data.document;

    if (!document) {
        console.log('No document provided');

        return null;
    }

    const documentId = document.file_id;

    try {
        const message = await bot.sendDocument(channelId, documentId, {
            caption: data.caption,
        });

        return message;
    } catch (e) {
        console.log('Error sending document: ', e);

        return null;
    }
};
