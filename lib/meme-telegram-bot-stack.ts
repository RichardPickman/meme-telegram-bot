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

const envVars = {
    prod: {
        TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN!,
        TELEGRAM_PROPOSAL_CHANNEL_ID: TELEGRAM_PROPOSAL_CHANNEL_ID!,
        TELEGRAM_MEME_CHANNEL_ID: TELEGRAM_MEME_CHANNEL_ID!,
    },
    test: {
        TELEGRAM_BOT_TOKEN: TESTING_BOT_TOKEN!,
        TELEGRAM_PROPOSAL_CHANNEL_ID: TESTING_PROPOSAL_CHANNEL_ID!,
        TELEGRAM_MEME_CHANNEL_ID: TESTING_MEME_CHANNEL_ID!,
    },
};

export class MemeTelegramBotStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        stageName: 'prod' | 'test',
        props?: StackProps,
    ) {
        super(scope, id, props);

        const memeTelegramBotHandler = new NodejsFunction(
            this,
            'Meme Telegram Bot',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'telegram-listener.ts'),
                environment: {
                    ...envVars[stageName],
                    stageName,
                },
            },
        );

        const api = new RestApi(this, 'MemeTelegramBot', {
            restApiName: 'MemeTelegramBot',
        });

        const commandsAddress = api.root.addResource('commands');
        const proposeMeme = commandsAddress.addResource('propose-meme');

        proposeMeme.addMethod(
            'POST',
            new LambdaIntegration(memeTelegramBotHandler),
        );
    }
}
