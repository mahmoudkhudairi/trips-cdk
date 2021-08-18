const tripModel = require('/opt/nodejs/trips.schema.js');
exports.handler = async (event) => {
  try {
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
