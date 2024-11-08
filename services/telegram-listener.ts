import { APIGatewayProxyEvent } from 'aws-lambda';
import { proceedWithAdminAction } from './actions/admin';
import { proceedWithMemeProposal } from './actions/proposal';
import {
    isMessageContainImageOrVideo,
    isMessageContainPrivateChatType,
    isMessageIsCallbackQuery,
} from './utils/booleans';
import { ErrorResponse, SUCCESSFUL_RESPONSE } from './utils/responses';

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

const getBodyOrNull = (event: APIGatewayProxyEvent) =>
    event.body ? JSON.parse(event.body) : null;

/*
    Main handler, that recieves api requests from API Gateway

    @param message - Message object from Telegram Message interface

    @returns boolean
*/
export const handler = async (event: APIGatewayProxyEvent) => {
    console.log('Starting handler...');

    const body = getBodyOrNull(event);

    console.log('This is BODY: ', body);

    if (!body) {
        console.log('Invalid event');

        return ErrorResponse('Invalid event');
    }

    const message = body.message;

    if (!message) {
        console.log('Message property is missing.');

        return ErrorResponse('No message present');
    }

    // Check chat type presence
    const isMemeProposal = isMessageContainPrivateChatType(body.message);
    const hasMedia = isMessageContainImageOrVideo(body);

    if (isMemeProposal && hasMedia) {
        console.log(
            'Request is determined as meme proposal... Proceeding with media...',
        );

        return await proceedWithMemeProposal(body);
    }

    const isAdminAction = isMessageIsCallbackQuery(body);

    if (isAdminAction) {
        return await proceedWithAdminAction(body);
    }

    return SUCCESSFUL_RESPONSE;
};
