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
  body('name')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Name must be between 10 and 100 characters inclusive')
    .escape(),
  body('dateTime')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Date and time is required')
    .matches(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/)
    .withMessage('Invalid date/time format, compare: YYYY-MM-DDThh:mm:ss.sssZ'),
  body('desc')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters inclusive')
    .escape(),
  body('onlinePlatforms')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Online platform must be at least 1'),
  body('onlinePlatforms.*.name')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Online platform must have name')
    .isLength({ min: 2, max: 30 })
    .withMessage('Online platform name be between 2 and 30 char long'),
  body('onlinePlatforms.*.url')
    .isURL()
    .withMessage('Invalid URL')
    .trim(' ')
    .isLength({ min: 15, max: 255 })
    .withMessage('Online platform URL must be between 15 and 255 char long'),
  body('venue')
    .optional()
    .notEmpty()
    .withMessage('Venue cannot be empty if present'),
  body('venue.country')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.state')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.city')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.address')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Address must be between 10 and 100 characters inclusive')
    .escape(),
  body('venue.zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt({ min: 1 })
    .withMessage('Zip code must be number greater than 0')
    .escape(),
  body('mission')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Mission cannot be empty')
    .isLength({ min: 10, max: 255 })
    .withMessage('Mission must be between 10 and 255 characters inclusive')
    .escape(),
  body('vision')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Vision cannot be empty')
    .isLength({ min: 10, max: 255 })
    .withMessage('Vision must be between 10 and 255 characters inclusive')
    .escape(),
  body('website')
    .optional()
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Website cannot be empty')
    .isLength({ min: 12, max: 255 })
    .withMessage('Website must be between 12 and 255 characters inclusive')
    .escape(),
  body('sdg')
    .optional()
    .isInt({ min: 1, max: 17 })
    .withMessage('SDG must be any of goal 1 to 17'),
  body('socialMedia')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Social media must be between 1 and 10'),
  body('socialMedia.*.name')
    .isString()
    .trim(' ')
    .notEmpty()
    .withMessage('Social media must have name and url')
    .isIn(['Instagram', 'Twitter', 'Facebook', 'LinkedIn'])
    .withMessage('Social media name not recognised'),
  body('socialMedia.*.url')
    .isURL()
    .trim(' ')
    .notEmpty()
    .withMessage('Social media must have URI')
    .isLength({ min: 15, max: 255 })
    .withMessage('Social media must have URI iwth approriate length'),
  body('needs')
    .optional()
    .isArray({ min: 1, max: 100 })
    .withMessage('Need items must be between 1 and 100'),
  body('needs.*.name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Need item name must be between 2 and 100 characters long'),
  body('needs.*.desc')
    .isString()
    .notEmpty()
    .isLength({ min: 12, max: 255 })
    .withMessage('Description must be between 12 and 255 characters long'),
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
    .isLength({ min: 1, max: 100 })
    .withMessage('Purpose cannot exceed 100 characters long'),
];

module.exports = validators;
