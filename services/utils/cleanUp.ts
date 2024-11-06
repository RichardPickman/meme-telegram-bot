import { bot } from '../instanses';
import { ErrorResponse } from './responses';

export const cleanUpAfterAction = async (
    channelId: string,
    memeId: string,
    controlsId: number,
) => {
    console.log('Cleaning up after action...');

    try {
        await bot.deleteMessage(channelId, Number(memeId));

        await bot.deleteMessage(channelId, controlsId);

        return;
    } catch (e) {
        console.log('Error cleaning up after action. Error: ', e);

        return ErrorResponse('Error cleaning up after action');
    }
};
