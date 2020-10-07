const { mongoose } = require('../../configs/mongodb-config');
const NeedItemSchema = require('./need-item-schema');
const SocialMediaSchema = require('./social-media-schema');

const { Schema, model } = mongoose;

class validators {
  /**
   * @description Dynamically validates the size range of an array field
   * @param {Number} min minimum length
   * @param {Number} max maximum length
   */
  static arrayLengthRange(min, max) {
    return (val) => (
      val.length >= min
      && val.length <= max
    );
  }

  /**
   * @description Dynamically validates the data type of an array of data
   * @param {SchemaType} Type schema type
   */
  static arrayDataType(Type) {
    return (val) => val.every((e) => (
      Type(e) === e
    ));
  }
}

const NGOSchema = new Schema({
  authId: {
    type: Schema.Types.ObjectId,
    ref: 'Auth',
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
  },
  mission: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 255,
  },
  vision: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 255,
  },
  website: {
    type: String,
    minlength: 12,
    maxlength: 255,
  },
  cacNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
  },
  sdgs: {
    type: [{}],
    ref: 'SDG',
    required: true,
    validate: [
      {
        validator: validators.arrayLengthRange(1, 5),
        msg: 'NGOs must have between 1 and 5 SDGs',
      },
      {
        validator: validators.arrayDataType(Number),
        msg: 'SDGs should be signified by their goal number',
      },
    ],
  },
  socialMedia: {
    type: [SocialMediaSchema],
    required: true,
    validate: [
      validators.arrayLengthRange(1, 5),
      'NGOs must have between 1 and 5 social media accounts',
    ],
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  zipCode: {
    type: Number,
    min: 1,
  },
  address: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500,
  },
  needs: [NeedItemSchema],
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
}, { timestamps: true });

const NGOModel = model('NGO', NGOSchema);

module.exports = NGOModel;
