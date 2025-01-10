#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HitCounterStack } from '../lib/hit counter-stack';

const app = new cdk.App();
new HitCounterStack(app, 'HitCounterStack', {

});