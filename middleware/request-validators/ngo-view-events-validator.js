const { param, header } = require('express-validator');
const { mongoose: { Types } } = require('../../configs/mongodb-config');

// GET /ngo/:ngoId/donation/:donationId
// GET /ngo/:ngoId/event/:eventId/donation/:donationId
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
    .withMessage('Invalid NGO ID'),
  param('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid Event ID'),
];

module.exports = validators;
