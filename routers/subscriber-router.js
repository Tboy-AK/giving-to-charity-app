const { Router } = require('express');
const createSubscriberValidator = require('../middleware/request-validators/subscriber-reg-validator');
const unsubscribeValidator = require('../middleware/request-validators/unsubscribe-validator');
const errResponse = require('../utils/error-response-handler');
const SubscriberModel = require('../models/mongodb-models/subscriber-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createSubscriber, unsubscribe } = require('../controllers/subscriber-controller')(errResponse, SubscriberModel, EventModel, NGOModel);

const SubscriberRouter = Router();

SubscriberRouter
  .route('/subscriber')
  .post(createSubscriberValidator, createSubscriber);

SubscriberRouter
  .route('/subscriber/:subscriberId')
  .delete(unsubscribeValidator, unsubscribe);

module.exports = { SubscriberRouter };
