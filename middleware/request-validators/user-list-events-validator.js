const { query } = require('express-validator');

// GET /event?page&limit|ngo
const validators = [
  query('ngoId')
    .optional()
    .notEmpty()
    .withMessage('NGO ID is required')
    .isMongoId()
    .withMessage('Invalid NGO ID'),
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
