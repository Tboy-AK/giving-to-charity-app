const { Router } = require('express');
const createSubscriberValidator = require('../middleware/request-validators/subscriber-reg-validator');
const errResponse = require('../utils/error-response-handler');
const SubscriberModel = require('../models/mongodb-models/subscriber-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createSubscriber } = require('../controllers/subscriber-controller')(errResponse, SubscriberModel, EventModel, NGOModel);

const SubscriberRouter = Router();

SubscriberRouter.post('/subscriber', createSubscriberValidator, createSubscriber);

module.exports = { SubscriberRouter };
