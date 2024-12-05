import { SQSEvent } from 'aws-lambda';
import { proceedWithAdminAction } from './actions/admin';
import { proceedWithChannelAction } from './actions/channel';
import { proceedWithMemeProposal } from './actions/proposal';
import {
    isActionContainChannelPostOrMessage,
    isGroupPost,
    isMessageContainPrivateChatType,
    isMessageIsCallbackQuery,
} from './utils/booleans';
import { getBodyOrNull } from './utils/helpers';
import { SuccessfullResponse } from './utils/responses';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_PROPOSAL_CHANNEL_ID = process.env.TELEGRAM_PROPOSAL_CHANNEL_ID;
const TELEGRAM_MEME_CHANNEL_ID = process.env.TELEGRAM_MEME_CHANNEL_ID;

const ENV_VARS = [
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
    TELEGRAM_MEME_CHANNEL_ID,
];

if (!ENV_VARS.every(Boolean)) {
    throw new Error('One or more environmental variables are not set');
}

export const handler = async (event: SQSEvent) => {
    console.log('Starting handler...');

    console.log('Proceed with event: ', event);

    for (const record of event.Records) {
        const body = getBodyOrNull(record);

        if (!body) {
            console.log('Invalid event');

            continue;
        }

        console.log('Proceed with body: ', body);

        // Check chat type presence
        const isMemeProposal = isMessageContainPrivateChatType(body.message);
        const isSuitableAction = isActionContainChannelPostOrMessage(body);

        if (isMemeProposal && isSuitableAction) {
            console.log(
                'Request is determined as meme proposal... Proceeding with media...',
            );

            await proceedWithMemeProposal(body);

            continue;
        }

        const isAdminAction = isMessageIsCallbackQuery(body);

        if (isAdminAction) {
            await proceedWithAdminAction(body);

            continue;
        }

        const isPostInChannel = isGroupPost(body.channel_post);

        if (isPostInChannel) {
            await proceedWithChannelAction(body);

            continue;
        }
    }

    console.log('No record found');

    return SuccessfullResponse('Handler ended without errors');
};
