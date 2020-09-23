const express = require('express');
const authValidator = require('../middleware/request-validators/auth-validator');
const errResponse = require('../utils/error-response-handler');

const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { userSignin } = require('../controllers/auth-controller')(
  errResponse, AuthModel, { AdminModel, NGOModel },
);

const AuthRouter = express.Router();

AuthRouter.post('/auth', authValidator, userSignin);

module.exports = { AuthRouter };
