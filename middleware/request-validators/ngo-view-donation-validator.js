const { param, header } = require('express-validator');
const { mongoose: { Types } } = require('../../configs/mongodb-config');

// GET /ngo/:ngoId/donation/:donationId
// GET /event/:eventId/donation/:donationId
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
    .if((val, { req }) => !(
      !val && !req.eventId
    ) && !req.eventId)
    .withMessage('Resource ID cannot be empty')
    .notEmpty()
    .withMessage('NGO ID is required')
    .isMongoId()
    .withMessage('Invalid NGO ID'),
  param('eventId')
    .if((val, { req }) => !(
      !val && !req.ngoId
    ) && !req.ngoId)
    .withMessage('Resource ID cannot be empty')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid Event ID'),
  param('donationId')
    .notEmpty()
    .withMessage('Donation ID is required')
    .isMongoId()
    .withMessage('Invalid donation ID'),
];

module.exports = validators;
