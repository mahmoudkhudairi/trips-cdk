const uuid = require('uuid').v4;
const tripSchema = require('./trips.schema.js');
const dynamoose = require('dynamoose');
exports.handler = async (event) => {
  try {
    const tripModel = dynamoose.model('trips', tripSchema);
    const { pickup, dropoff, price } = JSON.parse(event.body);
    if (!pickup || !dropoff || !price) {
      throw new Error('missing arguments');
    }
    const id = uuid();
    const record = new tripModel({ id, pickup, dropoff, price });
    const data = await record.save();
    const response = {
      statusCode: 201,
      body: JSON.stringify(data),
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
