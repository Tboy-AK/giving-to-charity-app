const { Router } = require('express');
const ngoRegValidator = require('../middleware/request-validators/ngo-reg-validator');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createNGO } = require('../controllers/ngo-reg-controller')(errResponse, AuthModel, NGOModel);

const NGORegRouter = Router();

NGORegRouter.post('/ngo', ngoRegValidator, createNGO);

module.exports = { NGORegRouter };
