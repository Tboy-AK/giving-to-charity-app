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
    .trim(' ')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Name must be between 10 and 100 characters inclusive')
    .escape(),
  body('mission')
    .trim(' ')
    .notEmpty()
    .withMessage('Mission number is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Mission must be between 10 and 255 characters inclusive')
    .escape(),
  body('vision')
    .trim(' ')
    .notEmpty()
    .withMessage('Vision is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Vision must be between 10 and 255 characters inclusive')
    .escape(),
  body('website')
    .trim(' ')
    .notEmpty()
    .withMessage('Website is required')
    .isLength({ min: 12, max: 255 })
    .withMessage('Website must be between 12 and 255 characters inclusive')
    .escape(),
  body('country')
    .trim(' ')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('state')
    .trim(' ')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('city')
    .trim(' ')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('address')
    .trim(' ')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Address must be between 10 and 100 characters inclusive')
    .escape(),
  body('cacNumber')
    .trim(' ')
    .notEmpty()
    .withMessage('CAC number is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('CAC number must be between 3 and 10 characters inclusive')
    .escape(),
  body('zipCode')
    .trim(' ')
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt({ min: 1 })
    .withMessage('Zip code must be number greater than 0')
    .escape(),
  body('sdgs')
    .isArray({ min: 1, max: 5 })
    .withMessage('SDG must be between 1 and 100 inclusive'),
  body('socialMedia')
    .isArray({ min: 1 })
    .withMessage('Social media must be at least 1'),
  body('needs')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Needs must have at least 1 item'),
];

module.exports = validators;
