const { body, header } = require('express-validator');
const { mongoose: { Types } } = require('../../configs/mongodb-config');

const validators = [
  header('useraccesspayload')
    .notEmpty()
    .withMessage('Not authorized')
    .custom((val) => (
      Types.ObjectId(val.authId)
      && Types.ObjectId(val.authId).toHexString() === val.authId
    ))
    .withMessage('Invalid access'),
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
  body('firstName')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters')
    .escape(),
  body('lastName')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters')
    .escape(),
];

module.exports = validators;
