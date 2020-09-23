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
   * @description The concerned field checks if the online platforms field has data in it
   */
  static onlinePlatformsExists() {
    return function validation(val) {
      return (
        !(
          !(
            val
            && val.country
            && val.state
            && val.city
            && val.address
          )
          && this.onlinePlatforms.length === 0
        )
      );
    };
  }

  /**
  * @description The concerned field checks if the venue field has data in it
  */
  static venueExists() {
    return function validation(val) {
      return (
        !(
          !(
            this.venue
            && this.venue.country
            && this.venue.state
            && this.venue.city
            && this.venue.address
          )
          && val.length === 0
        )
      );
    };
  }

  /**
   * @description This function ensures that the date specified meets the minimum set time span
   * @param {Number} timeSpan (ms) The minimum time span allowable in miliseconds
   */
  static earlyBooking(timeSpan) {
    return (val) => (
      new Date(val).valueOf() - Date.now() >= timeSpan
    );
  }
}

const AddressSchema = new Schema({
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
    min: 2,
  },
  address: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500,
  },
}, { _id: false });

const OnlinePlatformSchema = {
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  url: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
};

const EventSchema = new Schema({
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  dateTime: {
    type: Date,
    required: true,
    validate: [validators.earlyBooking(2592000000), 'Time span too short'],
  },
  desc: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 255,
  },
  mission: {
    type: String,
    minlength: 12,
    maxlength: 255,
  },
  vision: {
    type: String,
    minlength: 12,
    maxlength: 255,
  },
  website: {
    type: String,
    minlength: 12,
    maxlength: 255,
  },
  sdg: {
    type: Number,
    ref: 'SDG',
    required: true,
  },
  onlinePlatforms: {
    type: [OnlinePlatformSchema],
    validate: [
      {
        validator: validators.venueExists(),
        msg: 'Online platforms and physical venue cannot all be empty',
      },
      {
        validator: validators.arrayLengthRange(0, 5),
        msg: 'Online platforms cannot exceed 5',
      },
    ],
  },
  socialMedia: [SocialMediaSchema],
  venue: {
    type: AddressSchema,
    validate: [
      validators.onlinePlatformsExists(),
      'Physical venue and online platforms cannot all be empty',
    ],
  },
  needs: [NeedItemSchema],
}, { timestamps: true });

EventSchema.index({ ngoId: 1, name: 1 }, { unique: true });

const EventModel = model('Event', EventSchema);

module.exports = EventModel;
