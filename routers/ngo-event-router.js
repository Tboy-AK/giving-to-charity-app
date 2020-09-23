const express = require('express');
const authNGO = require('../middleware/auth-ngo');
const eventValidator = require('../middleware/request-validators/ngo-post-event-validator');
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const AuthModel = require('../models/mongodb-models/auth-model');
const { createEvent } = require('../controllers/ngo-event-controller')(errResponse, NGOModel, EventModel, AuthModel);

const NGOEventRouter = express.Router();

NGOEventRouter.post('/ngo/:ngoId/event', authNGO, eventValidator, createEvent);

module.exports = { NGOEventRouter };
