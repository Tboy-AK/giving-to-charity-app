const { body } = require('express-validator');

const validators = [
  body()
    .isArray({ min: 1 })
    .withMessage('Request body must be an array'),
  body('*.name')
    .isString()
    .withMessage('Name must be text')
    .trim(' ')
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Item name must be between 2 and 30 characters long')
    .escape(),
  body('*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a whole non-zero number'),
  body('*.desc')
    .isString()
    .withMessage('Description must be text')
    .trim(' ')
    .notEmpty()
    .withMessage('Descriptions make items much clearer')
    .isLength({ min: 12, max: 100 })
    .withMessage('Description must be between 12 and 100 character length')
    .escape(),
  body('*.purpose')
    .optional()
    .isString()
    .withMessage('Purpose must be text')
    .trim(' ')
    .notEmpty()
    .withMessage('Purpose cannot be empty if present')
    .isLength({ min: 12, max: 100 })
    .withMessage('Purpose must be between 12 and 100 character length')
    .escape(),
];

module.exports = validators;
