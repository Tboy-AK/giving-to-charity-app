const { mongoose } = require('../../configs/mongodb-config');

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
   * @description Checks that NGO ID is provided
   */
  static ngoExists() {
    return function validation(val) {
      return (
        !(
          !val
          && !this.ngoId
        )
      );
    };
  }

  /**
   * @description Checks that event ID is provided
   */
  static eventExists() {
    return function validation(val) {
      return (
        !(
          !val
          && !this.eventId
        )
      );
    };
  }

  /**
   * @description Checks if the logistics is to be handeld by the NGO
   */
  static ngoHandlesLogistics() {
    return function validation() {
      return (
        this.logistics === 'ngo'
      );
    };
  }
}

const DonationItemSchema = new Schema({
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
    minlength: 10,
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
  purpose: {
    type: String,
    minlength: 10,
    maxlength: 100,
    trim: ' ',
  },
}, { _id: false });

const PickupSchema = new Schema({
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
    min: 100,
  },
  address: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500,
  },
}, { _id: false });

const DonationSchema = new Schema({
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
    validate: [
      validators.eventExists(),
      'Event or NGO must be provided',
    ],
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    validate: [
      validators.ngoExists(),
      'Event or NGO must be provided',
    ],
  },
  items: [DonationItemSchema],
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 30,
    trim: ' ',
  },
  dateTime: {
    type: Date,
    required: true,
    min: [
      Date.now() + 2592000000,
      'Time span should be at least a month ahead',
    ],
  },
  logistics: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['donor', 'ngo'],
  },
  pickup: {
    type: PickupSchema,
    validate: [
      validators.ngoHandlesLogistics(),
      'Pickup point for the NGO to locate the donor must be included',
    ],
  },
}, { timestamps: true });

const DonationModel = model('Donation', DonationSchema);

module.exports = DonationModel;
