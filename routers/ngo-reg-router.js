const { Router } = require('express');
const authAdmin = require('../middleware/auth-admin-middleware');
const ngoRegValidator = require('../middleware/request-validators/ngo-reg-validator');
const ngoVerifyValidator = require('../middleware/request-validators/ngo-verify-validator');
const userListNGOsValidator = require('../middleware/request-validators/user-list-ngos-validator');
const userViewNGOValidator = require('../middleware/request-validators/user-view-ngo-validator');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const {
  createNGO, adminVerifyNGO, listNGOs, viewNGO,
} = require('../controllers/ngo-reg-controller')(errResponse, AuthModel, NGOModel);

const NGORegRouter = Router();

NGORegRouter
  .route('/ngo')
  .get(userListNGOsValidator, listNGOs) // User can list all NGOs
  .post(ngoRegValidator, createNGO); // NGO can register

NGORegRouter
  .route('/ngo/:ngoId')
  .get(userViewNGOValidator, viewNGO); // User can view an NGO

NGORegRouter
  .route('/ngo/:ngoId/verify')
  .patch(authAdmin, ngoVerifyValidator, adminVerifyNGO); // Admin can verify NGO

module.exports = { NGORegRouter };
