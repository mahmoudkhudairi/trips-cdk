const dynamoose = require('dynamoose');

const tripsSchema = new dynamoose.Schema({
  id: String,
  pickup: String,
  dropoff: String,
  price: String,
  status: { type: String, enum: ['ongoing', 'canceled', 'completed'], default: 'ongoing' },
});

module.exports = dynamoose.model('trips', tripsSchema);
