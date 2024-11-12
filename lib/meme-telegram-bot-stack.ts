import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_MEME_CHANNEL_ID,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
    TESTING_BOT_TOKEN,
    TESTING_MEME_CHANNEL_ID,
    TESTING_PROPOSAL_CHANNEL_ID,
} from './environments';
import { commonLambdaProps, rootDir } from './helpers';

const lambdaPath = path.join(rootDir, 'services');

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_PROPOSAL_CHANNEL_ID) {
    throw new Error('One or more environmental variables are not set');
}

const envVars = {
    production: {
        TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN!,
        TELEGRAM_PROPOSAL_CHANNEL_ID: TELEGRAM_PROPOSAL_CHANNEL_ID!,
        TELEGRAM_MEME_CHANNEL_ID: TELEGRAM_MEME_CHANNEL_ID!,
    },
    testing: {
        TELEGRAM_BOT_TOKEN: TESTING_BOT_TOKEN!,
        TELEGRAM_PROPOSAL_CHANNEL_ID: TESTING_PROPOSAL_CHANNEL_ID!,
        TELEGRAM_MEME_CHANNEL_ID: TESTING_MEME_CHANNEL_ID!,
    },
};

export class MemeTelegramBotStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const stage = id.split('-');

        if (!stage[1]) {
            throw new Error('No stage name flag is passed. Aborting...');
        }

        const stageName = stage[1] as 'testing' | 'production';

        const memeTelegramBotHandler = new NodejsFunction(
            this,
            'Meme Telegram Bot',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'telegram-listener.ts'),
                environment: {
                    ...envVars[stageName],
                },
            },
        );

        const api = new RestApi(this, 'MemeTelegramBot', {
            restApiName: 'MemeTelegramBot',
        });

        const commandsAddress = api.root;

        commandsAddress.addMethod(
            'POST',
            new LambdaIntegration(memeTelegramBotHandler),
        );
    }
}
