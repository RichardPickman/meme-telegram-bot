import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import {
    CodePipeline,
    CodePipelineSource,
    ManualApprovalStep,
    ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_MEME_CHANNEL_ID,
    TELEGRAM_PROPOSAL_CHANNEL_ID,
} from './environments';
import { PipelineAppStageStack } from './stage';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'MemeTelegramBotPipeline', {
            pipelineName: 'MemeTelegramBotPipeline',
            synth: new ShellStep('MemeTelegramBotSynth', {
                input: CodePipelineSource.gitHub(
                    'RichardPickman/meme-telegram-bot',
                    'master',
                ),
                env: {
                    TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN!,
                    TELEGRAM_PROPOSAL_CHANNEL_ID: TELEGRAM_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID: TELEGRAM_MEME_CHANNEL_ID!,
                },
                commands: ['npm install', 'npx cdk synth'],
            }),
        });

        const testStage = new Stage(
            new PipelineAppStageStack(this, 'testing'),
            'TestingStage',
        );

        const productionStage = new Stage(
            new PipelineAppStageStack(this, 'production'),
            'ProductionStage',
        );

        pipeline
            .addStage(testStage)
            .addPost(new ManualApprovalStep('Approve testing stage'));

        pipeline
            .addStage(productionStage)
            .addPost(new ManualApprovalStep('Approve production stage'));
    }
}
