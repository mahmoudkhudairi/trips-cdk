const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const apigateway = require('@aws-cdk/aws-apigateway');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const { CdkPipeline, SimpleSynthAction } = require('@aws-cdk/pipelines');
const codepipeline = require('@aws-cdk/aws-codepipeline');
const codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
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
    // create the pipeline
    this.createPipeline();
    // create role for lambda function
    const dynamoRole = new Role(this, 'dynamoRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchEventsFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      ],
    });
    // create lambda layers
    const axiosLayer = this.createLambdaLayer('axiosLayer', '/functions/layers/axios');
    const dynamoLayer = this.createLambdaLayer('dynamoLayer', '/functions/layers/dynamo');

    // create the handler functions
    const createTripHandler = this.createLambda(
      'create-trip',
      '/functions/create-trip/',
      dynamoRole,
      null,
      [dynamoLayer],
    );
    const getPriceHandler = this.createLambda(
      'getPrice',
      '/functions/get-price/',
      null,
      {
        DISTANCE_MATRIX_API_KEY: process.env.DISTANCE_MATRIX_API_KEY,
      },
      [axiosLayer],
    );
    const updateTripHandler = this.createLambda(
      'update-trip',
      '/functions/update-trip/',
      dynamoRole,
      null,
      [dynamoLayer],
    );
    const getCompletedTripsHandler = this.createLambda(
      'get-completed-trips',
      '/functions/get-completed-trips/',
      dynamoRole,
      null,
      [dynamoLayer],
    );

    // create the dynamodb table
    const tripTable = new dynamodb.Table(this, 'trips', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
    // create the apigateway
    const tripApi = new apigateway.RestApi(this, 'trip-api');
    const tripsResource = tripApi.root.addResource('trips');
    const tripParamResource = tripsResource.addResource('{id}');
    const priceResource = tripsResource.addResource('price');
    const postTripIntegration = new apigateway.LambdaIntegration(createTripHandler);
    const getCompletedTripsIntegration = new apigateway.LambdaIntegration(getCompletedTripsHandler);
    const updateTripIntegration = new apigateway.LambdaIntegration(updateTripHandler);
    const getPriceIntegration = new apigateway.LambdaIntegration(getPriceHandler);
    tripsResource.addMethod('POST', postTripIntegration);
    tripsResource.addMethod('GET', getCompletedTripsIntegration);
    tripParamResource.addMethod('PATCH', updateTripIntegration);
    priceResource.addMethod('GET', getPriceIntegration);
  }

  createLambda(name, functionPath, role, environment, layers = []) {
    return new lambda.Function(this, name, {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.join(__dirname, functionPath)),
      handler: 'index.handler',
      role,
      environment,
      layers,
    });
  }

  createLambdaLayer(name, layerPath) {
    return new lambda.LayerVersion(this, name, {
      code: lambda.Code.fromAsset(path.join(__dirname, layerPath)),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
    });
  }
  createPipeline() {
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'PaymentPipeline',
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN'),
        trigger: codepipeline_actions.GitHubTrigger.POLL,
        // Replace these with your actual GitHub project info
        owner: 'mahmoudkhudairi',
        branch: 'main',
        repo: 'trips-cdk',
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        buildCommand: 'npm run build',
      }),
    });
  }
}

module.exports = { PaymentCdkStack };
