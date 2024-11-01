#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

const app = new cdk.App();

new MemeTelegramBotStack(app, 'MemeTelegramBotStack-testing');
new MemeTelegramBotStack(app, 'MemeTelegramBotStack-production');

app.synth();
