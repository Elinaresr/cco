import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppConfig } from "./custom-stack";
//import { ApiStack } from "./api-stack";
//import { StorageStack } from "./dynamo-stack";
import { getStackName } from "../utils/naming";

interface InfraStageProps extends cdk.StageProps {
  config: AppConfig;
}

export class InfraStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: InfraStageProps) {
    super(scope, id, props);
    const { config } = props;
/*
    const storageStack = new StorageStack(this, getStackName("StorageStack"), {
      config,
    });

    new ApiStack(this, getStackName("ApiStack"), {
      config,
      table: storageStack.table,
    });*/
  }
}
