import { Duration, Stack, StackProps } from 'aws-cdk-lib/core';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class CdkCustomVpcProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.100.0.0/16'),
      maxAzs: 3,
      natGateways: 0,  //Change the value to 3 if you want subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'CustomPublic',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        // {
        //   cidrMask: 24,
        //   name: 'application',
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        // },
        {
          cidrMask: 24,
          name: 'CustomPrivate',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ]

    });

    const cfnSecurityGroup = new ec2.CfnSecurityGroup(this, 'CustomALBSG', {
      groupDescription: 'CustomALBSG',
      groupName: 'CustomALBSG-2026',
      securityGroupEgress: [{
        ipProtocol: '-1',
        cidrIp: '0.0.0.0/0',
        description: 'AllOutbound'
      }],
      securityGroupIngress: [
          {
              ipProtocol: 'tcp',
              cidrIp: '0.0.0.0/0',
              description: 'Inbound with Port 80',
              fromPort: 80,
              toPort: 80,
              // sourcePrefixListId: 'sourcePrefixListId',
              // sourceSecurityGroupId: 'sourceSecurityGroupId',
              // sourceSecurityGroupName: 'sourceSecurityGroupName',
              // sourceSecurityGroupOwnerId: 'sourceSecurityGroupOwnerId',
          },
          {
              ipProtocol: 'tcp',
              cidrIp: '0.0.0.0/0',
              description: 'Inbound with Port 80',
              fromPort: 443,
              toPort: 443,
              // sourcePrefixListId: 'sourcePrefixListId',
              // sourceSecurityGroupId: 'sourceSecurityGroupId',
              // sourceSecurityGroupName: 'sourceSecurityGroupName',
              // sourceSecurityGroupOwnerId: 'sourceSecurityGroupOwnerId',
          }
      ],
      // tags: [{
      //   key: 'key',
      //   value: 'value',
      // }],
      vpcId: vpc.vpcId,
    });

    const cfnSecurityGroupEC2 = new ec2.CfnSecurityGroup(this, 'CustomEC2SG', {
      groupDescription: 'CustomEC2SG',
      groupName: 'CustomEC2SG-2026',
      securityGroupEgress: [{
        ipProtocol: '-1',
        cidrIp: '0.0.0.0/0',
        description: 'AllOutbound'
      }],
      securityGroupIngress: [
          {
              ipProtocol: 'tcp',
              // cidrIp: '0.0.0.0/0',
              description: 'Inbound with Port 80',
              fromPort: 80,
              toPort: 80,
              // sourcePrefixListId: 'sourcePrefixListId',
              sourceSecurityGroupId: cfnSecurityGroup.attrId,
              // sourceSecurityGroupName: 'sourceSecurityGroupName',
              // sourceSecurityGroupOwnerId: 'sourceSecurityGroupOwnerId',
          },
          {
            ipProtocol: 'tcp',
            // cidrIp: '0.0.0.0/0',
            description: 'Inbound with Port 80',
            fromPort: 443,
            toPort: 443,
            // sourcePrefixListId: 'sourcePrefixListId',
            sourceSecurityGroupId: cfnSecurityGroup.attrId,
            // sourceSecurityGroupName: 'sourceSecurityGroupName',
            // sourceSecurityGroupOwnerId: 'sourceSecurityGroupOwnerId',
          },
      ],
      // tags: [{
      //   key: 'key',
      //   value: 'value',
      // }],
      vpcId: vpc.vpcId,
    });
    
  }
}
