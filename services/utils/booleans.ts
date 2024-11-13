import { Message, Update } from 'node-telegram-bot-api';
import { bot } from '../instances/bot';

export const isPhotoParameterExist = (data: Message) => 'photo' in data;
export const isVideoParameterExist = (data: Message) => 'video' in data;
export const isDocumentParameterExist = (data: Message) => 'document' in data;

export const isForwardedMessage = (body: Update) => 'channel_post' in body;
export const isMessage = (body: Update) => 'message' in body;
export const isAdmin = async (id: number, channelId: string) => {
    const admins = await bot.getChatAdministrators(channelId);

    const hasAdmin = admins.find((admin) => admin.user.id === id);

    return Boolean(hasAdmin);
};
export const isActionContainChannelPostOrMessage = (body: Update) =>
    [isForwardedMessage(body), isMessage(body)].some(Boolean);

export const isMessageIsCallbackQuery = (body: Update) =>
    'callback_query' in body;
export const isMessageContainPrivateChatType = (
    message: Message | undefined,
) => {
    const chat = message?.chat ?? undefined;

    if (chat && chat.type === 'private') {
        return true;
    }

    return false;
};
