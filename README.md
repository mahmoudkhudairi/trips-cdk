# trips-cdk

## Overview

- AWS infrastructure as code using aws-cdk for trips management

## Stack

- AWS CDK
- Google Distance Matrix API
- CodePipeline
- DynamoDB
- Lambda
- Api Gateway

## Features

- getting price for distance traveled between 2 points
- creating trip
- updating trip
- getting all completed trips

## Endpoint

- `https://2giaj9487h.execute-api.eu-west-2.amazonaws.com/prod`

## Routes

### Trip Price

| Method | Endpoint     | Description                          |
| :----- | :----------- | :----------------------------------- |
| GET    | /trips/price | required queryParams: pickup,dropoff |

#### Example

- Request query params

```JSON
{
"pickup":"31.94694008788403%2C%2035.88156626565889",
"dropoff":"31.95983649227741%2C%2035.87103379541623"
}
```

- Response

```JSON
{
  "price":1.5
}
```

### Create Trip

| Method | Endpoint | Description                         |
| :----- | :------- | :---------------------------------- |
| POST   | /trips/  | required body: pickup,dropoff,price |

#### Example

- Request body

```JSON
{
  "pickup": "31.94694008788403, 35.88156626565889",
  "dropoff": "31.95983649227741, 35.87103379541623",
  "price": "1.5"
}
```

- Response

```JSON
{
  "id": "75c77b0a-6a62-4d73-8014-42134d6d10e2",
  "pickup": "31.94694008788403, 35.88156626565889",
  "dropoff": "31.95983649227741, 35.87103379541623",
  "price": "1.5",
  "status": "ongoing"
}
```

### Update Trip

| Method | Endpoint    | Description |
| :----- | :---------- | :---------- |
| PATCH  | /trips/{id} |             |

#### Example

- request

```JSON
{
  "param":"75c77b0a-6a62-4d73-8014-42134d6d10e2"
}
```

- response

```JSON
{
  "results": [
    {
      "id": "75c77b0a-6a62-4d73-8014-42134d6d10e2",
      "price": "1.5",
      "dropoff": "31.95983649227741, 35.87103379541623",
      "pickup": "31.94694008788403, 35.88156626565889",
      "status": "completed"
    }
  ]
}
```

### Get All Completed Trips

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET    | /trips/  |             |

#### Example

- Response

```JSON
{
  "results": [
    {
      "id": "75c77b0a-6a62-4d73-8014-42134d6d10e2",
      "price": "1.5",
      "dropoff": "31.95983649227741, 35.87103379541623",
      "pickup": "31.94694008788403, 35.88156626565889",
      "status": "completed"
    }
  ]
}
```

## Dependencies

```JSON
{
   "@aws-cdk/aws-apigateway": "^1.116.0",
    "@aws-cdk/aws-codepipeline": "^1.116.0",
    "@aws-cdk/aws-codepipeline-actions": "^1.116.0",
    "@aws-cdk/aws-dynamodb": "^1.116.0",
    "@aws-cdk/aws-iam": "^1.116.0",
    "@aws-cdk/aws-lambda": "^1.116.0",
    "@aws-cdk/core": "1.116.0",
    "@aws-cdk/pipelines": "^1.116.0",
    "dotenv": "^10.0.0",
    "axios": "^0.21.1",
    "dynamoose": "^2.7.3",
    "uuid": "^8.3.2"
}
```

## Getting started

- clone this repository to your local machine
- configure the environment variable in `.env` file to your `DISTANCE_MATRIX_API_KEY`
- run `npx cdk bootstrap aws://ACCOUNT_NUMBER/REGION`
- run `npx cdk deploy`
- in order for the pipeline to work you will need to
  - generate a `personal access token` with `repo` and `admin:repo_hook` scops
  - set `GITHUB_TOKEN` with the token value in `aws secrets Manager`
