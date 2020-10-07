const { body, header, param } = require('express-validator');
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
    .withMessage('Cannot implement route')
    .isMongoId()
    .withMessage('Invalid access'),
  param('eventId')
    .notEmpty()
    .withMessage('Cannot implement route')
    .isMongoId()
    .withMessage('Invalid access'),
  body('name')
    .isString()
    .withMessage('Item name must be a string')
    .isLength({ min: 2, max: 30 })
    .withMessage('Need item name must be between 2 and 30 characters long'),
];

module.exports = validators;
