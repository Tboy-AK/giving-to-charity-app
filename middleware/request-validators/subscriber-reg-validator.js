const { body } = require('express-validator');

const validators = [
  body('email')
    .trim(' ')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Not a valid email')
    .normalizeEmail({ all_lowercase: true }),
  body('phone')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Phone number must include country code'),
  body('country')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Country cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('state')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('State cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('city')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('sdgs')
    .optional()
    .isArray({ min: 1, max: 17 })
    .withMessage('Specify at least 1 SDG, but not beyond 17')
    .custom((value, { req }) => !(
      (
        !value || value.length === 0
      ) && (
        !req.ngos || req.ngos.length === 0
      )
    ))
    .withMessage('At least SDGs or NGOs must be specified'),
  body('sdgs.*')
    .isInt({ min: 1, max: 17 })
    .withMessage('Specify SDGs by their numbers. There are currently only 1 to 17 SDGs'),
  body('ngos')
    .optional()
    .isArray({ min: 1, max: 50 })
    .withMessage('Specify at least 1 NGO, but not beyond 50')
    .custom((value, { req }) => !(
      (
        !value || value.length === 0
      ) && (
        !req.sdgs || req.sdgs.length === 0
      )
    ))
    .withMessage('At least NGOs or SDGs must be specified'),
  body('ngos.*')
    .isMongoId()
    .trim(' ')
    .isLength({ min: 1, max: 24 })
    .withMessage('Specify NGOs by their IDs'),
];

module.exports = validators;
