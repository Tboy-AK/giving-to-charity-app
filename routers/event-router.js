const { Router } = require('express');
const listEventsValidator = require('../middleware/request-validators/user-list-events-validator');
const viewEventValidator = require('../middleware/request-validators/user-view-events-validator');
const errResponse = require('../utils/error-response-handler');
const EventModel = require('../models/mongodb-models/event-model');
const { listEvents, viewEvent } = require('../controllers/event-controller')(errResponse, EventModel);

const EventRouter = Router();

EventRouter
  .route('/event')
  .get(listEventsValidator, listEvents);

EventRouter
  .route('/event/:eventId')
  .get(viewEventValidator, viewEvent);

module.exports = { EventRouter };
