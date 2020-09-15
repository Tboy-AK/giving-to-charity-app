const { mongoose } = require('../../configs/mongodb-config');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
}, { timestamps: true });
const SubscriberModel = mongoose.model('Subscriber', SubscriberSchema);

module.exports = SubscriberModel;
