import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { commonLambdaProps, rootDir } from './helpers';

const lambdaPath = path.join(rootDir, 'src');

export class MemeTelegramBotStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const proposalDb = new Table(this, 'MyTable', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            sortKey: { name: 'createdAt', type: AttributeType.NUMBER },
        });

        proposalDb.addGlobalSecondaryIndex({
            indexName: 'CreatedAtIndex',
            partitionKey: { name: 'id', type: AttributeType.STRING },
            sortKey: { name: 'createdAt', type: AttributeType.NUMBER },
        });

        const memeTelegramBotHandler = new NodejsFunction(
            this,
            'Meme Telegram Bot',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'index.ts'),
                environment: {
                    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
                    TELEGRAM_PROPOSAL_CHANNEL_ID:
                        process.env.TELEGRAM_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID:
                        process.env.TELEGRAM_MEME_CHANNEL_ID!,
                    MEME_DATABASE_TABLE_NAME: proposalDb.tableName,
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
