import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MemeTelegramBotStack } from './meme-telegram-bot-stack';

export class PipelineAppStageStack extends Stack {
    constructor(scope: Construct, stageName: string, props?: StackProps) {
        super(scope, stageName, props);

        new MemeTelegramBotStack(this, 'MemeTelegramBot', stageName);
    }
}
