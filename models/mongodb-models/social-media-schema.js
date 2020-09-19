const { mongoose } = require('../../configs/mongodb-config');

const SocialMediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'],
  },
  url: {
    type: String,
    minlength: 5,
    maxlength: 100,
    trim: ' ',
  },
}, { timestamps: true });

module.exports = SocialMediaSchema;
