const { param } = require('express-validator');

// GET /event/:eventId
const validators = [
  param('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid Event ID'),
];

module.exports = validators;
