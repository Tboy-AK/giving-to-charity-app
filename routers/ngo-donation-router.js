const { Router } = require('express');
const ngoDonationValidator = require('../middleware/request-validators/ngo-donation-by-ngo-validator');
const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { donateItem } = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

const NGODonationRouter = Router();

NGODonationRouter.route('/ngo/:ngoId/donation').post(ngoDonationValidator, donateItem);

module.exports = { NGODonationRouter };
