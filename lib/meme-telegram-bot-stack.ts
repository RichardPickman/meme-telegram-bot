import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
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
            removalPolicy: RemovalPolicy.DESTROY,
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

        proposalDb.addGlobalSecondaryIndex({
            indexName: 'publishTime',
            partitionKey: { name: 'publishTime', type: AttributeType.STRING },
        });

        const memePublisherHandler = new NodejsFunction(
            this,
            'Meme publisher handler',
            {
                ...commonLambdaProps,
                entry: path.join(lambdaPath, 'publishMeme.ts'),
                environment: {
                    TELEGRAM_PROPOSAL_CHANNEL_ID:
                        process.env.TELEGRAM_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID:
                        process.env.TELEGRAM_MEME_CHANNEL_ID!,
                    MEME_DATABASE_TABLE_NAME: proposalDb.tableName,
                },
            },
        );

        proposalDb.grantReadWriteData(memePublisherHandler);
        proposalDb.grantReadWriteData(memeTelegramBotHandler);

        const rule = new Rule(this, 'Rule', {
            schedule: Schedule.cron({ minute: '*/10' }),
        });

        rule.addTarget(new LambdaFunction(memePublisherHandler));

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
