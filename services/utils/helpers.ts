import { APIGatewayProxyEvent } from 'aws-lambda';
import { Message } from 'node-telegram-bot-api';

type MediaDataOutput = {
    type: 'photo' | 'video';
    media: string;
};

export const getBodyOrNull = (event: APIGatewayProxyEvent) =>
    event.body ? JSON.parse(event.body) : null;

export const getMediaDataFromMessage = (
    message: Message,
): MediaDataOutput | null => {
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
