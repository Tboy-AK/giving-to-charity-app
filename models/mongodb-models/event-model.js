const { mongoose } = require('../../configs/mongodb-config');
const NeedItemSchema = require('./need-item-schema');
const SocialMediaSchema = require('./social-media-schema');

const { Schema, model } = mongoose;

class validators {
  static venueExists(val) {
    return (
      (
        val.country
        && val.state
        && val.city
        && val.address
        && val.platforms
        && val.platforms.length > 0
      )
      || (
        !(
          val.country
          && val.state
          && val.city
          && val.address
        )
        && val.platforms
        && val.platforms.length > 0
      )
      || (
        val.country
        && val.state
        && val.city
        && val.address
        && (
          !val.platforms
          || val.platforms.length === 0
        )
      )
    );
  }
}

const AddressSchema = {
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
    required: true,
    min: 1,
  },
  address: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500,
  },
};

const EventSchema = new Schema({
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'NGO',
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 100,
  },
  goal: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 255,
  },
  website: {
    type: String,
    minlength: 12,
    maxlength: 255,
  },
  sdg: {
    type: Schema.Types.ObjectId,
    ref: 'SDG',
    unique: true,
    required: true,
  },
  socialMedia: [SocialMediaSchema],
  venue: {
    type: AddressSchema,
    validate: validators.venueExists,
  },
  needs: [NeedItemSchema],
}, { timestamps: true });
const EventModel = model('Event', EventSchema);

module.exports = EventModel;
