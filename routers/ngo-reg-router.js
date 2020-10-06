const { Router } = require('express');
const authAdmin = require('../middleware/auth-admin-middleware');
const ngoRegValidator = require('../middleware/request-validators/ngo-reg-validator');
const ngoVerifyValidator = require('../middleware/request-validators/ngo-verify-validator');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createNGO, adminVerifyNGO } = require('../controllers/ngo-reg-controller')(errResponse, AuthModel, NGOModel);

const NGORegRouter = Router();

NGORegRouter
  .route('/ngo')
  .post(ngoRegValidator, createNGO); // NGO can register

NGORegRouter
  .route('/ngo/:ngoId/verify')
  .patch(authAdmin, ngoVerifyValidator, adminVerifyNGO); // Admin can verify NGO

module.exports = { NGORegRouter };
