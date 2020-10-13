const { Router } = require('express');
const eventDonationValidator = require('../middleware/request-validators/event-donation-validator');
const eventListDonationValidator = require('../middleware/request-validators/ngo-list-donation-validator');
const eventViewDonationValidator = require('../middleware/request-validators/ngo-view-donation-validator');
const authNgo = require('../middleware/auth-ngo-middleware');
const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const EventModel = require('../models/mongodb-models/event-model');
const AuthModel = require('../models/mongodb-models/auth-model');
const {
  donateItem, listDonations, viewDonation, receiveDonation,
} = require('../controllers/event-donation-controller')(errResponse, DonationModel, EventModel, AuthModel);

const EventDonationRouter = Router();

EventDonationRouter
  .route('/event/:eventId/donation')
  .post(eventDonationValidator, donateItem)
  .get(authNgo, eventListDonationValidator, listDonations);

EventDonationRouter
  .route('/event/:eventId/donation/:donationId')
  .get(authNgo, eventViewDonationValidator, viewDonation);

EventDonationRouter
  .route('/event/:eventId/donation/:donationId/received')
  .patch(authNgo, eventViewDonationValidator, receiveDonation);

module.exports = { EventDonationRouter };
