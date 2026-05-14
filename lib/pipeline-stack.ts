import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as pipeline from "aws-cdk-lib/pipelines";
import { InfraStage } from "./infra-stage";
import devParams from "../utils/dev.json";
import prodParams from "../utils/prod.json";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = codecommit.Repository.fromRepositoryName(
      this,
      "TemplateCdkCco",
      "template-cdk-cco"
    );

    const ci = new pipeline.CodePipeline(this, "TemplateCdkCcoPipeline", {
      pipelineName: "template-cdk-cco-pipeline",
      synth: new pipeline.ShellStep("Synth", {
        input: pipeline.CodePipelineSource.codeCommit(repository, "main"),
        installCommands: [
          "npm install -g aws-cdk",
          "npm install -g cdk-assets"
        ],
        commands: [
          "npm ci",
          "cd lambda/myFunction && npm install",
          "cd ../..",
          "npm run build",
          "npx cdk synth",
        ],
      }),
      synthCodeBuildDefaults: {
        rolePolicy: []
      },
      crossAccountKeys: true,
    });

    // ---------------- Dev API Stage ----------------
    const devApiStage = new InfraStage(this, "Dev", {
      env: { account: devParams.accountId, region: devParams.region },
      config: { env: "dev", params: devParams },
    });
    ci.addStage(devApiStage);


    // ---------------- Prod API Stage ----------------
    const prodApiStage = new InfraStage(this, "Prod", {
      env: { account: prodParams.accountId, region: prodParams.region },
      config: { env: "prod", params: prodParams },
    });
    const prodDeployment = ci.addStage(prodApiStage);
    prodDeployment.addPre(new pipeline.ManualApprovalStep("Approve"));

  }
}
