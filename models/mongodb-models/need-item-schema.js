const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const NeedItemSchema = new Schema({
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
    maxlength: 100,
    trim: ' ',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  supply: {
    type: Number,
    required: true,
    min: 0,
  },
  purpose: {
    type: String,
    minlength: 5,
    maxlength: 100,
    trim: ' ',
  },
}, { timestamps: true });

module.exports = NeedItemSchema;
