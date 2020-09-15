const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const TestimonySchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: ' ',
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: ' ',
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 30,
    trim: ' ',
  },
  content: {
    type: String,
    required: true,
    minlength: 12,
    trim: ' ',
  },
  imgUrl: {
    type: String,
    minlength: 12,
    maxlength: 255,
    trim: ' ',
  },
}, { timestamps: true });
const TestimonyModel = mongoose.model('Testimony', TestimonySchema);

module.exports = TestimonyModel;
