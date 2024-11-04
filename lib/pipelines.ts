import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import {
    CodePipeline,
    CodePipelineSource,
    ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { GITHUB_TOKEN } from './environments';
import { PipelineAppStage } from './stage';

const github = 'RichardPickman/meme-telegram-bot';
const inputOptions = {
    authentication: new SecretValue(GITHUB_TOKEN),
};
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
                input: CodePipelineSource.gitHub(
                    github,
                    'testing',
                    inputOptions,
                ),
                commands,
                env: {
                    TELEGRAM_BOT_TOKEN: process.env.TESTING_BOT_TOKEN!,
                    TELEGRAM_PROPOSAL_CHANNEL_ID:
                        process.env.TESTING_PROPOSAL_CHANNEL_ID!,
                    TELEGRAM_MEME_CHANNEL_ID:
                        process.env.TESTING_MEME_CHANNEL_ID!,
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
