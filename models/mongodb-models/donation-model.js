const { mongoose } = require('../../configs/mongodb-config');

const { Schema, model } = mongoose;

class validators {
  /**
   * @description Arrays and Strings - Dynamically validates an inclusive max length
   * @param {Number} max maximum length inclusive
   */
  static arrayMaxLength(max) {
    return (val) => (
      val && val.length <= max
    );
  }

  /**
   * @description Arrays and Strings - Dynamically validates an inclusive min length
   * @param {Number} min minimum length inclusive
   */
  static arrayMinLength(min) {
    return (val) => (
      val && val.length >= min
    );
  }

  /**
   * @description Checks that NGO ID is provided
   */
  static ngoExists() {
    return function validation(val) {
      return (
        !(!val && !this.ngoId)
        && val && !this.ngoId
      );
    };
  }

  /**
   * @description Checks that event ID is provided
   */
  static eventExists() {
    return function validation(val) {
      return (
        !(!val && !this.eventId)
        && val && !this.eventId
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
    required: true,
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
  street: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  zipCode: {
    type: Number,
    min: 100,
  },
  address: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500,
  },
  landmark: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
}, { _id: false });

const DonationSchema = new Schema({
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'NGO',
    validate: [
      validators.eventExists(),
      'Event or NGO must be provided',
    ],
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    validate: [
      validators.ngoExists(),
      'Event or NGO must be provided',
    ],
  },
  items: {
    type: [DonationItemSchema],
    validate: [
      validators.arrayMinLength(1),
      'At least an item must be provided',
    ],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 30,
    trim: ' ',
  },
  dateTime: {
    type: Date,
    required: true,
    min: [
      Date.now() + 3600000,
      'Donation cannot be made before the current time',
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
  received: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true });

const DonationModel = model('Donation', DonationSchema);

module.exports = DonationModel;
