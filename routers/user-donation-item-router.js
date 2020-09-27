const { Router } = require('express');
const userSetDonationItemValidator = require('../middleware/request-validators/user-set-donation-item-validator');
const errResponse = require('../utils/error-response-handler');
const ProhibitedDonationItemModel = require('../models/mongodb-models/prohibited-donation-item-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { getSuggestions } = require('../controllers/user-donation-item-controller')(errResponse, ProhibitedDonationItemModel, EventModel, NGOModel);

const UserDonationItemRouter = Router();

UserDonationItemRouter.post('/donation_items', userSetDonationItemValidator, getSuggestions);

module.exports = { UserDonationItemRouter };
