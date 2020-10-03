const { header, param, query } = require('express-validator');
const { mongoose: { Types } } = require('../../configs/mongodb-config');

// GET /ngo/:ngoId/donation?page&limit
// GET /event/:eventId/donation?page&limit
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
  query('page')
    .notEmpty()
    .withMessage('Page number is required')
    .isInt({ min: 1 })
    .withMessage('Page number must be a non-zero positive integer')
    .toInt(10)
    .customSanitizer((val) => (val - 1)),
  query('limit')
    .notEmpty()
    .withMessage('Page limit is required')
    .isInt({ min: 10, max: 100 })
    .withMessage('Page limit must be a positive integer between 10 and 100 inclusive')
    .toInt(10),
];

module.exports = validators;
