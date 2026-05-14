import { Construct } from "constructs";
import devParams from "../utils/dev.json";
import tags from "../utils/tags.json";
import * as cdk from "aws-cdk-lib";

export interface AppConfig {
  env: "dev" | "prod";
  params: typeof devParams;
}

export interface CustomStackProps extends cdk.StackProps {
  config: AppConfig;
}

export abstract class CustomStack extends cdk.Stack {
  readonly config: AppConfig;

  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, props);
    this.config = props.config;
    this.addTagsToAllResources();
  }
  protected getResourceName = (name: string) => getResourceName(name, this);
  protected addTagsToAllResources = () => addTagsToAllResources(this);
}

export abstract class CustomNestedStack extends cdk.NestedStack {
  readonly config: AppConfig;

  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, props);
    this.config = props.config;
    this.addTagsToAllResources();
  }
  protected getResourceName = (name: string) => getResourceName(name, this);
  protected addTagsToAllResources = () => addTagsToAllResources(this);
}

function getResourceName(
  name: string,
  context: CustomNestedStack | CustomStack
) {
  return tags.name_app.concat("-", name, "-", context.config.env);
}

function addTagsToAllResources(context: CustomNestedStack | CustomStack) {
  let tagName: keyof typeof tags;
  for (tagName in tags) {
    cdk.Tags.of(context).add(tagName, tags[tagName]);
  }
  cdk.Tags.of(context).add("environment", context.config.env);
}
