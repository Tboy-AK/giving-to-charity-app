const { body, header } = require('express-validator');

const validators = [
  header('useraccesspayload')
    .notEmpty()
    .withMessage('User must be authorized'),
  body('name')
    .trim(' ')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Name must be between 10 and 100 characters inclusive')
    .escape(),
  body('dateTime')
    .notEmpty()
    .withMessage('Date and time is required')
    .isDate()
    .withMessage('Invalid date/time format. Compare YYYY-MM-DDThh:mm:ss.sssZ'),
  body('desc')
    .trim(' ')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Description must be between 10 and 255 characters inclusive')
    .escape(),
  body('onlinePlatforms')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Online platform must be at least 1'),
  body('onlinePlatforms.*.name')
    .trim(' ')
    .notEmpty()
    .withMessage('Online platform must have name and url')
    .isLength({ min: 2, max: 30 })
    .withMessage('Online platform must have URI iwth approriate length'),
  body('onlinePlatforms.*.url')
    .trim(' ')
    .notEmpty()
    .withMessage('Online platform must have URI')
    .isLength({ min: 15, max: 255 })
    .withMessage('Online platform must have URI iwth approriate length'),
  body('venue')
    .optional()
    .notEmpty()
    .withMessage('Venue cannot be empty if present'),
  body('venue.country')
    .trim(' ')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.state')
    .trim(' ')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.city')
    .trim(' ')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters inclusive')
    .escape(),
  body('venue.address')
    .trim(' ')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Address must be between 10 and 100 characters inclusive')
    .escape(),
  body('venue.zipCode')
    .trim(' ')
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt({ min: 1 })
    .withMessage('Zip code must be number greater than 0')
    .escape(),
  body('mission')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Mission cannot be empty')
    .isLength({ min: 10, max: 255 })
    .withMessage('Mission must be between 10 and 255 characters inclusive')
    .escape(),
  body('vision')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Vision cannot be empty')
    .isLength({ min: 10, max: 255 })
    .withMessage('Vision must be between 10 and 255 characters inclusive')
    .escape(),
  body('website')
    .optional()
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
    .withMessage('Social media must be at least 1'),
  body('socialMedia.*.name')
    .trim(' ')
    .notEmpty()
    .withMessage('Social media must have name and url')
    .isIn(['Instagram', 'Twitter', 'Facebook', 'LinkedIn'])
    .withMessage('Social media name not recognised'),
  body('socialMedia.*.url')
    .trim(' ')
    .notEmpty()
    .withMessage('Social media must have URI')
    .isLength({ min: 15, max: 255 })
    .withMessage('Social media must have URI iwth approriate length'),
  body('needs')
    .optional()
    .isArray({ min: 1, max: 100 })
    .withMessage('Needs must have at least 1 item'),
  body('needs.*.name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Need must have name'),
];

module.exports = validators;
