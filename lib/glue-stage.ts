import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppConfig } from "./custom-stack";
import * as glue from "aws-cdk-lib/aws-glue";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { getStackName } from "../utils/naming";
import { CustomStack, CustomStackProps } from "./custom-stack";

interface InfraStageProps extends CustomStackProps {
  config: AppConfig;
}

export class GlueStage extends CustomStack {
  constructor(scope: Construct, id: string, props: InfraStageProps) {
    super(scope, id, props);
    const { config } = props;

    //validar nombre ssm
    const kmsS3KeyArnParam = ssm.StringParameter.valueForStringParameter(
      this, `/open-data/${config.env}/kms/s3/key-arn`
    );

    const glueRole = new iam.Role(this, 'conciliationGlueRole', {
      roleName: this.getResourceName('glue-role'),
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')
      ],
      inlinePolicies: {
        GlueETLPolicy: new iam.PolicyDocument({
          statements: [
            // Acceso a S3
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:ListBucket',
                's3:GetBucketLocation'
              ],
              resources: [
                `arn:aws:s3:::${config.params.bucketNameDataLake}`,
                `arn:aws:s3:::${config.params.bucketNameDataLake}/*`
              ],
            }),
            // Acceso a KMS
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'kms:Decrypt',
                'kms:Encrypt',
                'kms:GenerateDataKey',
                'kms:DescribeKey'
              ],
              resources: [kmsS3KeyArnParam]
            }),
            
            // Glue Catalog
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'glue:GetDatabase',
                'glue:GetTable',
                'glue:GetPartitions',
                'glue:CreateTable',
                'glue:UpdateTable',
                'glue:BatchCreatePartition'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });

    const storageStack = new StorageStack(this, getStackName("StorageStack"), {
      config,
    });

  }
}
