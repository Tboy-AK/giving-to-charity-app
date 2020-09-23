const { mongoose } = require('../../configs/mongodb-config');

const { Schema } = mongoose;

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

  /**
   * @description The concerned field checks if the SDGs field has data in it
   */
  static sdgsExists() {
    return function validation(val) {
      return (
        !(
          val.length === 0
          && this.sdgs.length === 0
        )
      );
    };
  }

  /**
   * @description The concerned field checks if the NGOs field has data in it
   */
  static ngosExists() {
    return function validation(val) {
      return (
        !(
          this.ngos.length === 0
          && val.length === 0
        )
      );
    };
  }
}

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  ngos: {
    type: [Schema.Types.ObjectId],
    ref: 'NGO',
    validate: [
      {
        validator: validators.sdgsExists(),
        msg: 'NGOs and SDGs cannot be all empty',
      },
      {
        validator: validators.arrayLengthRange(0, 100),
        msg: 'Subscribed NGOs cannot exceed 100',
      },
    ],
  },
  sdgs: {
    type: [{}],
    ref: 'SDG',
    validate: [
      {
        validator: validators.ngosExists(),
        msg: 'SDGs and NGOs cannot be all empty',
      },
      {
        validator: validators.arrayDataType(Number),
        msg: 'Expected SDG goal numbers',
      },
      {
        validator: validators.arrayLengthRange(0, 17),
        msg: 'Subscribed SDGs cannot exceed 17',
      },
    ],
  },
}, { timestamps: true });
const SubscriberModel = mongoose.model('Subscriber', SubscriberSchema);

module.exports = SubscriberModel;
