import { StackProps, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MemeTelegramBotStack } from './meme-telegram-bot-stack';

export class PipelineAppStage extends Stage {
    constructor(
        scope: Construct,
        stageName: 'prod' | 'test',
        props?: StackProps,
    ) {
        super(scope, stageName, props);

        new MemeTelegramBotStack(this, 'MemeTelegramBot', stageName);
    }
}
