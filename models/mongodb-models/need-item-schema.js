const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const NeedItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: ' ',
    lowercase: true,
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
    default: 1,
  },
  unit: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 20,
    trim: ' ',
    lowercase: true,
    default: 'piece',
  },
  supply: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  purpose: {
    type: String,
    minlength: 5,
    maxlength: 100,
    trim: ' ',
  },
}, { timestamps: true });

module.exports = NeedItemSchema;
