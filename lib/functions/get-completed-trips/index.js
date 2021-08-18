const tripModel = require('/opt/nodejs/trips.schema.js');

exports.handler = async (event) => {
  try {
    const results = await tripModel.scan('status').contains('completed').exec();

    const response = {
      statusCode: 200,
      body: JSON.stringify({ results }),
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
