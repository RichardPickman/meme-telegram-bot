import { Message, Update } from 'node-telegram-bot-api';

/*
    Check if message is from private chat with bot

    @param message - Message object from Telegram Message interface

    @returns boolean
*/
export const isMessageContainPrivateChatType = (
    message: Message | undefined,
) => {
    const chat = message?.chat ?? undefined;

    if (chat && chat.type === 'private') {
        return true;
    }

    return false;
};

export const isMessageContainImageOrVideo = (body: Update) =>
    [isForwardedMessage(body), isMessage(body)].some(Boolean);

export const isMessageIsCallbackQuery = (body: Update) =>
    'callback_query' in body;

export const isPhotoParameterExist = (data: Message) => 'photo' in data;
export const isVideoParameterExist = (data: Message) => 'video' in data;

export const isForwardedMessage = (body: Update) => 'channel_post' in body;
export const isMessage = (body: Update) => 'message' in body;
