const { body } = require('express-validator');

const validators = [
  body('*.name')
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
    .trim(' ')
    .notEmpty()
    .withMessage('Descriptions make items much clearer')
    .isLength({ min: 12, max: 255 })
    .withMessage('Online platform must have URI iwth approriate length'),
  body('*.purpose')
    .optional()
    .notEmpty()
    .withMessage('Purpose cannot be empty if present'),
];

module.exports = validators;
