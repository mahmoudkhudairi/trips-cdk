const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const apigateway = require('@aws-cdk/aws-apigateway');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const { ManagedPolicy, Role, ServicePrincipal } = require('@aws-cdk/aws-iam');
const path = require('path');
class PaymentCdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const dynamoWriteRole = new Role(this, 'dynamoWriteRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsReadOnlyAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      ],
    });
    const createTripHandler = new lambda.Function(this, 'create-trip', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '/functions/create-trip/')),
      handler: 'index.handler',
      role: dynamoWriteRole,
    });
    const tripTable = new dynamodb.Table(this, 'Trips', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
    // tripTable.grantWriteData(createTripHandler.role);
    const tripApi = new apigateway.RestApi(this, 'trip-api');
    const postTripIntegration = new apigateway.LambdaIntegration(createTripHandler);
    const trips = tripApi.root.addResource('trips');
    trips.addMethod('POST', postTripIntegration);
    // trips.addMethod('GET');
  }
}

module.exports = { PaymentCdkStack };
