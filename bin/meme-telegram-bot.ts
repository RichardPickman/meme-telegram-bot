#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { MemeTelegramBotStack } from '../lib/meme-telegram-bot-stack';

const app = new cdk.App();

new MemeTelegramBotStack(app, 'MemeTelegramBotStack-testing');
new MemeTelegramBotStack(app, 'MemeTelegramBotStack-production');
