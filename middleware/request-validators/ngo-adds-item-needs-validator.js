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
  body('*.name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Need item name must be between 2 and 100 characters long'),
  body('*.desc')
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 255 })
    .withMessage('Description must be between 12 and 255 characters long'),
  body('*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive non-zero number'),
  body('*.unit')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 20 })
    .withMessage('Units cannot exceed 20 characters long'),
  body('*.purpose')
    .optional()
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('Purpose cannot exceed 100 characters long'),
];

module.exports = validators;
