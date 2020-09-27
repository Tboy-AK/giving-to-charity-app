const { body } = require('express-validator');

const validators = [
  body('*.name')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Item name must be between 2 and 30 characters long'),
  body('*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a whole non-zero number')
    .escape(),
  body('*.desc')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Descriptions make items much clearer')
    .isLength({ min: 12, max: 100 })
    .withMessage('Description must be between 12 and 100 character length'),
  body('*.purpose')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Purpose cannot be empty if present')
    .isLength({ min: 12, max: 100 })
    .withMessage('Purpose must be between 12 and 100 character length'),
];

module.exports = validators;
