const { mongoose } = require('../../configs/mongodb-config');

const ProhibitedDonationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 50,
    lowercase: true,
  },
  desc: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 1023,
  },
}, { timestamps: true });
const ProhibitedDonationItemModel = mongoose.model('ProhibitedDonationItem', ProhibitedDonationItemSchema);

module.exports = ProhibitedDonationItemModel;
