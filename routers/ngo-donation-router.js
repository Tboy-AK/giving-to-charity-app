const { Router } = require('express');
const ngoDonationValidator = require('../middleware/request-validators/ngo-donation-validator');
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { donateItem } = require('../controllers/ngo-donation-controller')(errResponse, NGOModel);

const NGODonationRouter = Router();

NGODonationRouter.route('/ngo/:ngoId/donation/logistics/donor').post(ngoDonationValidator, donateItem);

NGODonationRouter.route('/ngo/:ngoId/donation/logistics/ngo').post(ngoDonationValidator, donateItem);

module.exports = { NGODonationRouter };
