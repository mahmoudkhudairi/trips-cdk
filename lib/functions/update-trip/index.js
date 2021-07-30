const tripSchema = require('./trips.schema.js');
const dynamoose = require('dynamoose');
exports.handler = async (event) => {
  try {
    const tripModel = dynamoose.model('trips', tripSchema);
    const id = event.pathParameters.id;
    const record = await tripModel.update({ id, status: 'completed' });

    const response = {
      statusCode: 200,
      body: JSON.stringify(record),
    };
    return response;
  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
    return response;
  }
};
