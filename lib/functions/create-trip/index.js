const uuid = require('uuid').v4;
const tripModel = require('/opt/nodejs/trips.schema.js');
exports.handler = async (event) => {
  try {
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
