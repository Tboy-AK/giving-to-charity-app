const { Router } = require('express');
const ngoDonationValidator = require('../middleware/request-validators/ngo-donation-validator');
const ngoListDonationValidator = require('../middleware/request-validators/ngo-list-donation-validator');
const ngoViewDonationValidator = require('../middleware/request-validators/ngo-view-donation-validator');
const ngoReceiveDonationValidator = require('../middleware/request-validators/ngo-receive-donation-validator');
const authNgo = require('../middleware/auth-ngo-middleware');
const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const {
  donateItem, listDonations, viewDonation, receiveDonation,
} = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

const NGODonationRouter = Router();

NGODonationRouter
  .route('/ngo/:ngoId/donation')
  .post(ngoDonationValidator, donateItem)
  .get(authNgo, ngoListDonationValidator, listDonations);

NGODonationRouter
  .route('/ngo/:ngoId/donation/:donationId')
  .get(authNgo, ngoViewDonationValidator, viewDonation);

NGODonationRouter
  .route('/ngo/:ngoId/donation/:donationId/received')
  .patch(authNgo, ngoReceiveDonationValidator, receiveDonation);

module.exports = { NGODonationRouter };
