import { Duration, Stack, StackProps } from 'aws-cdk-lib/core';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
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

    const vpcParameter = new ssm.StringParameter(this,'CustomVPCParameter',{
      parameterName: '/project/custom/vpc/id',
      stringValue: vpc.vpcId,
    });    

    const albSGParameter = new ssm.StringParameter(this,'ALBSGParameter',{
      parameterName: '/project/custom/alb/sg/id',
      stringValue: cfnSecurityGroup.attrId,
    });

    const ec2SGParameter = new ssm.StringParameter(this,'EC2SGParameter',{
      parameterName: '/project/custom/ec2/sg/id',
      stringValue: cfnSecurityGroupEC2.attrId,
    });

    const publicSubnet1Parameter = new ssm.StringParameter(this,'CustomPublicSubnet1Parameter',{
      parameterName: '/project/custom/public/subnet1/id',
      stringValue: vpc.publicSubnets[0].subnetId,
    }); 

    const publicSubnet2Parameter = new ssm.StringParameter(this,'CustomPublicSubnet2Parameter',{
      parameterName: '/project/custom/public/subnet2/id',
      stringValue: vpc.publicSubnets[1].subnetId,
    });

    // const publicSubnet3Parameter = new ssm.StringParameter(this,'CustomPublicSubnet3Parameter',{
    //   parameterName: '/project/custom/public/subnet3/id',
    //   stringValue: vpc.publicSubnets[2].subnetId,
    // });

    const privateSubnet1Parameter = new ssm.StringParameter(this,'CustomPrivateSubnet1Parameter',{
      parameterName: '/project/custom/private/subnet1/id',
      stringValue: vpc.isolatedSubnets[0].subnetId,
    }); 

    const privateSubnet2Parameter = new ssm.StringParameter(this,'CustomPrivateSubnet2Parameter',{
      parameterName: '/project/custom/private/subnet2/id',
      stringValue: vpc.isolatedSubnets[1].subnetId,
    }); 

    // const privateSubnet3Parameter = new ssm.StringParameter(this,'CustomPrivateSubnet3Parameter',{
    //   parameterName: '/project/custom/private/subnet3/id',
    //   stringValue: vpc.isolatedSubnets[2].subnetId,
    // });

    
    
  }
}
