#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CdkCustomVpcProjectStack } from '../lib/cdk-custom-vpc-project-stack';

const app = new cdk.App();
new CdkCustomVpcProjectStack(app, 'CdkCustomVpcProjectStack');
