const express = require('express');
const authValidator = require('../middleware/request-validators/auth-validator');
const errResponse = require('../utils/error-response-handler');

const AuthModel = require('../models/mongodb-models/auth-model');
const { userSignin } = require('../controllers/auth-controller')(errResponse, AuthModel);

const AuthRouter = express.Router();

AuthRouter.post('/auth', authValidator, userSignin);

module.exports = { AuthRouter };
