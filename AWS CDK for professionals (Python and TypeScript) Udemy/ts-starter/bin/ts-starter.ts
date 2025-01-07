#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TsStarterStack } from '../lib/ts-starter-stack';
//importujemy nowe moduły z nowymi stosami
import { TsSharedStack } from '../lib/ts-shared-stack';
import { TsHandlerStack } from '../lib/ts-handler-stack';

const app = new cdk.App();
new TsStarterStack(app, 'TsStarterStack', {});
const tsSharedStack = new TsSharedStack(app,'TsSharedStack',{}); //tworząc nowy stos musimy zapamiętać go w zmiennej, żeby się potem do niego odwołać
new TsHandlerStack(app,'TsHandlerStack',{
  sharedBucket: tsSharedStack.sharedBucket //podanie w parametrze wystawionego publicznie sharedBucket
});

