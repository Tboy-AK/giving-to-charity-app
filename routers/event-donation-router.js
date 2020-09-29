const { Router } = require('express');
const eventDonationValidator = require('../middleware/request-validators/event-donation-validator');
const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const EventModel = require('../models/mongodb-models/event-model');
const AuthModel = require('../models/mongodb-models/auth-model');
const { donateItem } = require('../controllers/event-donation-controller')(errResponse, DonationModel, EventModel, AuthModel);

const EventDonationRouter = Router();

EventDonationRouter.route('/event/:eventId/donation').post(eventDonationValidator, donateItem);

module.exports = { EventDonationRouter };
