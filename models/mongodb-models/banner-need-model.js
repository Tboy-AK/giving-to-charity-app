const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

const BannerNeedSchema = new Schema({
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
  imgUrl: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 255,
    trim: ' ',
  },
  url: {
    type: String,
    minlength: 12,
    maxlength: 255,
    trim: ' ',
  },
}, { timestamps: true });
const BannerNeedModel = mongoose.model('BannerNeed', BannerNeedSchema);

module.exports = BannerNeedModel;
