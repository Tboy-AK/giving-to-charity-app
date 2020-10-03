const { param, header } = require('express-validator');
const { mongoose: { Types } } = require('../../configs/mongodb-config');

const validators = [
  header('useraccesspayload')
    .notEmpty()
    .withMessage('Not authorized')
    .custom((val) => (
      Types.ObjectId(val.authId)
      && Types.ObjectId(val.authId).toHexString() === val.authId
    ))
    .withMessage('Invalid access'),
  param('ngoId')
    .notEmpty()
    .withMessage('NGO ID is required')
    .isMongoId()
    .withMessage('NGO ID not recognised'),
  param('donationId')
    .notEmpty()
    .withMessage('Donation ID is required')
    .isMongoId()
    .withMessage('Donation ID not recognised'),
];

module.exports = validators;
