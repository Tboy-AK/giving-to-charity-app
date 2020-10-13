const { param } = require('express-validator');

// GET /ngo/:ngoId
// GET /event/:eventId
const validators = [
  param('ngoId').notEmpty()
    .withMessage('NGO ID is required')
    .isMongoId()
    .withMessage('Invalid NGO ID'),
];

module.exports = validators;
