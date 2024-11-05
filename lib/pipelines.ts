import { Stack, StackProps } from 'aws-cdk-lib';
import {
    CodePipeline,
    CodePipelineSource,
    ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import {
    TESTING_BOT_TOKEN,
    TESTING_MEME_CHANNEL_ID,
    TESTING_PROPOSAL_CHANNEL_ID,
} from './environments';
import { PipelineAppStage } from './stage';

const commands = [
    'corepack enable',
    'corepack prepare pnpm@latest --activate',
    'npm install',
    'npx cdk synth',
];

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Meme Bot', {
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection(
                    'RichardPickman/meme-telegram-bot',
                    'testing',
                    {
                        connectionArn:
                            'arn:aws:codestar-connections:eu-west-2:905418082172:connection/733d69dc-dfa5-4ca6-b377-e4444c2f716e',
                    },
                ),
                commands,
                env: {
                    TELEGRAM_BOT_TOKEN: TESTING_BOT_TOKEN!,
                    TELEGRAM_PROPOSAL_CHANNEL_ID: TESTING_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID: TESTING_MEME_CHANNEL_ID!,
                },
            }),
        });

        pipeline.addStage(
            new PipelineAppStage(this, 'test', {
                env: {
                    account: this.account,
                    region: this.region,
                },
            }),
        );
    }
}
