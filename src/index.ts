import { APIGatewayProxyEvent } from 'aws-lambda';
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
import { ErrorResponse, SuccessfullResponse } from './utils/responses';

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

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log('Starting handler...');

    const body = getBodyOrNull(event);

    if (!body) {
        console.log('Invalid event');

        return ErrorResponse('Invalid event');
    }

    console.log('Proceed with body: ', body);

    // Check chat type presence
    const isMemeProposal = isMessageContainPrivateChatType(body.message);
    const isSuitableAction = isActionContainChannelPostOrMessage(body);

    if (isMemeProposal && isSuitableAction) {
        console.log(
            'Request is determined as meme proposal... Proceeding with media...',
        );

        return await proceedWithMemeProposal(body);
    }

    const isAdminAction = isMessageIsCallbackQuery(body);

    if (isAdminAction) {
        return await proceedWithAdminAction(body);
    }

    const isPostInChannel = isGroupPost(body.channel_post);

    if (isPostInChannel) {
        return await proceedWithChannelAction(body);
    }

    return SuccessfullResponse('Handler ended without errors');
};
