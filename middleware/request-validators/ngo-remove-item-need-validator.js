const { body, header } = require('express-validator');
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
  body('name')
    .isString()
    .isLength({ min: 2, max: 30 })
    .withMessage('Need item name must be between 2 and 30 characters long'),
];

module.exports = validators;
