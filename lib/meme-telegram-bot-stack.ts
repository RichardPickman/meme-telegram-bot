import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { commonLambdaProps, rootDir } from './helpers';

const lambdaPath = path.join(rootDir, 'src');

export class MemeTelegramBotStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

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
                },
            },
        );

        // const memeTelegramQueue = new Queue(this, 'MemeTelegramQueue', {
        //     queueName: 'MemeTelegramQueue',
        //     visibilityTimeout: Duration.seconds(15),
        //     retentionPeriod: Duration.hours(1),
        // });

        // const queueHandler = new NodejsFunction(
        //     this,
        //     'Meme Bot Queue Handler',
        //     {
        //         ...commonLambdaProps,
        //         entry: path.join(
        //             path.join(rootDir, 'services'),
        //             'queueHandler.ts',
        //         ),
        //         environment: {
        //             MEME_TELEGRAM_QUEUE_URL: memeTelegramQueue.queueUrl,
        //         },
        //     },
        // );

        // const queueHandlerPolicy = new PolicyStatement({
        //     effect: Effect.ALLOW,
        //     actions: ['sqs:SendMessage'],
        //     resources: [memeTelegramQueue.queueArn],
        // });

        // queueHandler.addToRolePolicy(queueHandlerPolicy);

        // memeTelegramBotHandler.addEventSource(
        //     new SqsEventSource(memeTelegramQueue, { batchSize: 1 }),
        // );

        const api = new RestApi(this, 'MemeTelegramBot', {
            restApiName: 'MemeTelegramBot',
        });

        // const queueUrl = api.root.addResource('queue');

        const commandsAddress = api.root;

        commandsAddress.addMethod(
            'POST',
            new LambdaIntegration(memeTelegramBotHandler),
        );

        // queueUrl.addMethod('POST', new LambdaIntegration(queueHandler));
    }
}
