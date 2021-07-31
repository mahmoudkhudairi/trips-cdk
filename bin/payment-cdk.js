#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { PaymentCdkStack } = require('../lib/payment-cdk-stack');

const app = new cdk.App();
new PaymentCdkStack(app, 'PaymentCdkStack', {
  env: {
    account: '128940465845',
    region: 'eu-west-2',
  },
});
app.synth();
