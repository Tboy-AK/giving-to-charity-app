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
    .trim(' ')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Phone number must include country code'),
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Password is required')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9a-zA-Z]).{8,64}$/)
    .withMessage('Use a strong password')
    .custom((password, { req }) => password === req.body.confirmPassword)
    .withMessage('Passwords must match')
    .escape(),
  body('name')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Name must be between 10 and 100 characters inclusive')
    .escape(),
  body('mission')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Mission number is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Mission must be between 10 and 255 characters inclusive')
    .escape(),
  body('vision')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Vision is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Vision must be between 10 and 255 characters inclusive')
    .escape(),
  body('website')
    .isURL()
    .trim(' ')
    .notEmpty()
    .withMessage('Website is required')
    .isLength({ min: 12, max: 255 })
    .withMessage('Website must be between 12 and 255 characters inclusive')
    .escape(),
  body('country')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('state')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('city')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('address')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Address must be between 10 and 100 characters inclusive')
    .escape(),
  body('cacNumber')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('CAC number is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('CAC number must be between 3 and 10 characters inclusive')
    .escape(),
  body('zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt({ min: 1 })
    .withMessage('Zip code must be number greater than 0')
    .escape(),
  body('sdgs')
    .isArray({ min: 1, max: 5 })
    .withMessage('List of SDGs cannot exceed 5'),
  body('sdgs.*')
    .isInt({ min: 1, max: 17 })
    .withMessage('SDG must be between 1 and 17'),
  body('socialMedia')
    .isArray({ min: 1 })
    .withMessage('Social media must be at least 1'),
  body('needs')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Needs must have at least 1 item'),
  body('needs.*.name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Need must have name'),
  body('needs.*.desc')
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 100 })
    .withMessage('Description must be between 12 and 100 characters long'),
  body('needs.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive non-zero number'),
  body('needs.*.unit')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 20 })
    .withMessage('Units cannot exceed 20 characters long'),
  body('needs.*.purpose')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 100 })
    .withMessage('Purpose must be between 12 and 100 characters long'),
];

module.exports = validators;
