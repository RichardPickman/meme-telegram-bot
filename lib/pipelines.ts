import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import {
    CodePipeline,
    CodePipelineSource,
    ManualApprovalStep,
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

        // const productionPipeline = new CodePipeline(
        //     this,
        //     'TelegramMemeBotProductionPipeline',
        //     {
        //         pipelineName: 'TelegramMemeBotProductionPipeline',
        //         synth: new ShellStep('MemeTelegramBotProductionSynth', {
        //             input: CodePipelineSource.gitHub(
        //                 github,
        //                 'master',
        //                 inputOptions,
        //             ),
        //             commands,
        //             env: {
        //                 TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
        //                 TELEGRAM_PROPOSAL_CHANNEL_ID:
        //                     process.env.TELEGRAM_PROPOSAL_CHANNEL_ID!,
        //                 TELEGRAM_MEME_CHANNEL_ID:
        //                     process.env.TELEGRAM_MEME_CHANNEL_ID!,
        //             },
        //         }),
        //     },
        // );

        const testingPipeline = new CodePipeline(
            this,
            'TelegramMemeBotTestingPipeline',
            {
                pipelineName: 'TelegramMemeBotTestingPipeline',
                synth: new ShellStep('MemeTelegramBotTestingSynth', {
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
            },
        );

        testingPipeline
            .addStage(
                new PipelineAppStage(this, 'test', {
                    stackName: 'test',
                }),
            )
            .addPost(new ManualApprovalStep('Approve testing stage'));

        //     productionPipeline
        //         .addStage(
        //             new PipelineAppStage(this, 'prod', {
        //                 stackName: 'prod',
        //             }),
        //         )
        //         .addPost(new ManualApprovalStep('Approve production stage'));
    }
}
