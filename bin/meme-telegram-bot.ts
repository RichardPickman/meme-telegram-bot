#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { PipelineStack } from '../lib/pipelines';

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack');

app.synth();
