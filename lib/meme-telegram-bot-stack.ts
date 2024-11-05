import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { commonLambdaProps, rootDir } from './helpers';

const lambdaPath = path.join(rootDir, 'services');

const environmentVariables = {
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
    constructor(
        scope: Construct,
        id: string,
        stageName: 'prod' | 'test',
        props?: StackProps,
    ) {
        super(scope, id, props);

        const stageName = id.split('-');

        if (!stageName[1]) {
            throw new Error(
                'Stage name is not valid. Must be set as - stageName-testing or stageName-production',
            );
        }

        const stage = stageName[1] as 'testing' | 'production';

        const memeTelegramBotHandler = new NodejsFunction(
            this,
            'Meme Telegram Bot',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'telegram-listener.ts'),
                environment: {
                    ...environmentVariables[stage],
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
