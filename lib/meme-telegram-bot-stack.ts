import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { commonLambdaProps, rootDir } from './helpers';
import path from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
    TELEGRAM_MEME_CHANNEL_ID,
} from './environments';

const lambdaPath = path.join(rootDir, 'services');

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_PROPOSAL_CHANNEL_ID) {
    throw new Error('One or more environmental variables are not set');
}

export class MemeTelegramBotStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const memeTelegramBotHandler = new NodejsFunction(
            this,
            'Meme Telegram Bot',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'telegram-listener.ts'),
                environment: {
                    TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN!,
                    TELEGRAM_PROPOSAL_CHANNEL_ID: TELEGRAM_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID: TELEGRAM_MEME_CHANNEL_ID!,
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

        new CfnOutput(this, 'Api address', {
            value: proposeMeme.path,
            exportName: 'RootApiAddress',
        });
    }
}
