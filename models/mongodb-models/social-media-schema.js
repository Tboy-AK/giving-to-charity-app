const { mongoose } = require('../../configs/mongodb-config');

const SocialMediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'],
  },
  url: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: ' ',
  },
}, { timestamps: true });

module.exports = SocialMediaSchema;
