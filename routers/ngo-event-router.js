const { Router } = require('express');
const authNGO = require('../middleware/auth-ngo-middleware');
const eventValidator = require('../middleware/request-validators/ngo-post-event-validator');
const listEventsValidator = require('../middleware/request-validators/ngo-list-events-validator');
const viewEventValidator = require('../middleware/request-validators/ngo-view-events-validator');
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const AuthModel = require('../models/mongodb-models/auth-model');
const { createEvent, listEvents, viewEvent } = require('../controllers/ngo-event-controller')(errResponse, NGOModel, EventModel, AuthModel);

const NGOEventRouter = Router();

NGOEventRouter
  .use('/ngo/:ngoId/event', authNGO)
  .use('/ngo/:ngoId/event/:eventId', authNGO);

NGOEventRouter
  .route('/ngo/:ngoId/event')
  .post(eventValidator, createEvent)
  .get(listEventsValidator, listEvents);

NGOEventRouter
  .route('/ngo/:ngoId/event/:eventId')
  .get(viewEventValidator, viewEvent);

module.exports = { NGOEventRouter };
