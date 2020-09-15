const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 30,
    trim: ' ',
  },
  content: {
    type: String,
    minlength: 12,
    trim: ' ',
  },
  url: {
    type: String,
    minlength: 12,
    maxlength: 255,
    trim: ' ',
  },
}, { timestamps: true });
const BlogModel = mongoose.model('Blog', BlogSchema);

module.exports = BlogModel;
