const dynamoose = require('dynamoose');

const fruitsSchema = new dynamoose.Schema({
  id: String,
  pickup: String,
  dropoff: String,
  price: String,
});

module.exports = dynamoose.model('fruits', fruitsSchema);
