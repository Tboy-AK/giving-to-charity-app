const { param, header } = require('express-validator');

const validators = [
  param('authActivateToken')
    .notEmpty()
    .withMessage('Invalid access')
    .isJWT()
    .withMessage('Invalid access'),
  header('useraccesspayload')
    .notEmpty()
    .withMessage('Not authorized'),
  header('useraccesspayload.email')
    .notEmpty()
    .withMessage('Not authorized')
    .isEmail()
    .withMessage('Invalid access'),
];

module.exports = validators;
