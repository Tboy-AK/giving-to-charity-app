const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const DonationItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
    trim: ' ',
  },
  desc: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: ' ',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  purpose: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: ' ',
  },
}, { timestamps: true });

module.exports = DonationItemSchema;
