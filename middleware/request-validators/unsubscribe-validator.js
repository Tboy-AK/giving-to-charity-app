const { param } = require('express-validator');

const validators = [
  param('subscriberId')
    .notEmpty()
    .withMessage('Not authorized')
    .isMongoId()
    .withMessage('Invalid access'),
];

module.exports = validators;
