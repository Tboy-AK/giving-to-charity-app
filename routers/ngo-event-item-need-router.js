const { Router } = require('express');
const authNGO = require('../middleware/auth-ngo-middleware');
const ngoAddNeedsValidator = require('../middleware/request-validators/ngo-adds-event-item-needs-validator');
const ngoRemoveNeedValidator = require('../middleware/request-validators/ngo-remove-event-item-need-validator');
const errResponse = require('../utils/error-response-handler');
const EventModel = require('../models/mongodb-models/event-model');
const { addNeeds, removeNeed } = require('../controllers/ngo-event-needs-controller')(errResponse, EventModel);

const NGOEventItemNeedsRouter = Router();

NGOEventItemNeedsRouter
  .route('/ngo/:ngoId/event/:eventId/need')
  // NGO can add to the list of needs for its event
  .post(authNGO, ngoAddNeedsValidator, addNeeds)
  // NGO can remove from the list of needs for its event
  .delete(authNGO, ngoRemoveNeedValidator, removeNeed);

module.exports = { NGOEventItemNeedsRouter };
