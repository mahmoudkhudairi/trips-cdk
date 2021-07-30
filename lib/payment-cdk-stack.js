const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const apigateway = require('@aws-cdk/aws-apigateway');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const { ManagedPolicy, Role, ServicePrincipal } = require('@aws-cdk/aws-iam');
const path = require('path');
require('dotenv').config();
class PaymentCdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    // create role for lambda function
    const dynamoRole = new Role(this, 'dynamoRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsReadOnlyAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      ],
    });
    // create the handler for create trip
    const createTripHandler = this.createLambda(
      'create-trip',
      '/functions/create-trip/',
      dynamoRole,
      null,
    );
    const getPriceHandler = this.createLambda('getPrice', '/functions/get-price/', null, {
      DISTANCE_MATRIX_API_KEY: process.env.DISTANCE_MATRIX_API_KEY,
    });
    // create the dynamodb table
    const tripTable = new dynamodb.Table(this, 'Trips', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
    // create the apigateway
    const tripApi = new apigateway.RestApi(this, 'trip-api');
    const tripsRoute = tripApi.root.addResource('trips');
    const priceRoute = tripsRoute.addResource('price');
    const postTripIntegration = new apigateway.LambdaIntegration(createTripHandler);
    const getPriceIntegration = new apigateway.LambdaIntegration(getPriceHandler);
    tripsRoute.addMethod('POST', postTripIntegration);
    priceRoute.addMethod('GET', getPriceIntegration);
  }

  createLambda(name, functionPath, role, environment) {
    return new lambda.Function(this, name, {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.join(__dirname, functionPath)),
      handler: 'index.handler',
      role,
      environment,
    });
  }
}

module.exports = { PaymentCdkStack };
