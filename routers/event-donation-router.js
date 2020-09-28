const { Router } = require('express');
const eventDonationValidator = require('../middleware/request-validators/event-donation-validator');
const errResponse = require('../utils/error-response-handler');
const EventModel = require('../models/mongodb-models/event-model');
const { donateItem } = require('../controllers/event-donation-controller')(errResponse, EventModel);

const EventDonationRouter = Router();

EventDonationRouter.route('/event/:eventId/donation/logistics/donor').post(eventDonationValidator, donateItem);

EventDonationRouter.route('/event/:eventId/donation/logistics/event').post(eventDonationValidator, donateItem);

module.exports = { EventDonationRouter };
