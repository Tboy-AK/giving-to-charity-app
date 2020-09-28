const { body, param, query } = require('express-validator');

const validators = [
  query('logisticsBy')
    .trim(' ')
    .notEmpty()
    .withMessage('Logististics handler must be present')
    .isIn(['ngo', 'donor']),
  param('ngoId')
    .trim(' ')
    .notEmpty()
    .withMessage('Event ID must be present')
    .isMongoId()
    .withMessage('Invalid access'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Needs must have at least 1 item'),
  body('items.*.name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Need must have name'),
  body('items.*.desc')
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 100 })
    .withMessage('Description must be between 12 and 100 characters long'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive non-zero number'),
  body('items.*.unit')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 20 })
    .withMessage('Units cannot exceed 20 characters long'),
  body('items.*.purpose')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 100 })
    .withMessage('Purpose must be between 12 and 100 characters long'),
  body('email')
    .trim(' ')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Not a valid email')
    .normalizeEmail({ all_lowercase: true }),
  body('phone')
    .trim(' ')
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Phone number must include country code'),
  body('dateTime')
    .notEmpty()
    .withMessage('Date and time is required')
    .isDate()
    .withMessage('Invalid date/time format. Compare YYYY-MM-DDThh:mm:ss.sssZ'),
  body('pickup')
    .notEmpty()
    .withMessage('Pickup point must be detailed out'),
  body('pickup.country')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Country cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('pickup.state')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('State cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('pickup.city')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('pickup.zipCode')
    .optional()
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt({ min: 100 })
    .withMessage('Zip code cannot be less than 100')
    .escape(),
  body('pickup.address')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Address must be between 10 and 100 characters inclusive')
    .escape(),
];

module.exports = validators;
