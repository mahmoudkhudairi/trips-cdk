const axios = require('axios');
exports.handler = async (event) => {
  try {
    const API_KEY = process.env.DISTANCE_MATRIX_API_KEY;
    if (!event.queryStringParameters.pickup || !event.queryStringParameters.dropoff) {
      throw new Error('missing query params');
    }
    const pickup = event.queryStringParameters.pickup;
    const dropoff = event.queryStringParameters.dropoff;
    const endpoint = encodeURI(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${pickup}&destinations=${dropoff}&key=${API_KEY}`,
    );
    const baseFare = process.env.BASE_FARE || 0.45;
    const costPerMin = process.env.COST_PER_MIN || 0.25;
    const costPerKm = process.env.COST_PER_KM || 0.35;
    const surgeBoostMultiplier = process.env.SURGE_BOOST_MULTIPLIER || 1;
    const minPrice = process.env.MIN_PRICE || 1.5;
    const res = await axios.get(endpoint);
    const elements = res.data.rows[0].elements;
    console.log('ELEMENTS', elements);
    const distance = elements[0].distance.value;
    const duration = elements[0].duration.value;
    const durationCost = (costPerMin * duration) / 1000;
    const distanceCost = (costPerKm * distance) / 1000;
    let rideFare = ((baseFare + durationCost + distanceCost) * surgeBoostMultiplier).toFixed(2);
    rideFare = rideFare < minPrice ? minPrice : rideFare;
    const response = {
      statusCode: 200,
      body: JSON.stringify({ price: rideFare }),
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
