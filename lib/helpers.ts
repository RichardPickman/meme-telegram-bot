import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';

export const rootDir = path.join(__dirname, '../');

export const commonLambdaProps: NodejsFunctionProps = {
    runtime: Runtime.NODEJS_20_X,
    projectRoot: rootDir,
    depsLockFilePath: path.join(rootDir, 'package-lock.json'),
    bundling: {
        externalModules: ['aws-sdk'],
        minify: false,
    },
};
