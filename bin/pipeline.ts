#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";
import { getStackName } from "../utils/naming";
import devopsParams from "../utils/devops-params.json";

const app = new cdk.App();
new PipelineStack(app, getStackName("PipelineStack"), {
  env: {
    account: devopsParams.accountId,
    region: devopsParams.region,
  },
});
