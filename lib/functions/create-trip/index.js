const uuid = require('uuid').v4;
const tripsModel = require('./trips.schema.js');
exports.handler = async (event) => {
  try {
    const { pickup, dropoff } = JSON.parse(event.body);
    console.log('WHAT', pickup, dropoff);
    const id = uuid();

    // Save it
    const record = new tripsModel({ id, pickup, dropoff });
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
