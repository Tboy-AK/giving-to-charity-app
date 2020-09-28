const { Router } = require('express');
const eventDonationValidator = require('../middleware/request-validators/event-donation-by-ngo-validator');
const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/event-model');
const EventModel = require('../models/mongodb-models/event-model');
const { donateItem } = require('../controllers/event-donation-controller')(errResponse, DonationModel, NGOModel, EventModel);

const EventDonationRouter = Router();

EventDonationRouter.route('/event/:eventId/donation').post(eventDonationValidator, donateItem);

module.exports = { EventDonationRouter };
