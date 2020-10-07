const { Router } = require('express');
const authNGO = require('../middleware/auth-ngo-middleware');
const ngoAddNeedsValidator = require('../middleware/request-validators/ngo-adds-item-needs-validator');
const ngoRemoveNeedValidator = require('../middleware/request-validators/ngo-remove-item-need-validator');
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { addNeeds, removeNeed } = require('../controllers/ngo-needs-controller')(errResponse, NGOModel);

const NGOItemNeedsRouter = Router();

NGOItemNeedsRouter
  .route('/ngo/:ngoId/need')
  .post(authNGO, ngoAddNeedsValidator, addNeeds) // NGO can add to its list of needs
  .delete(authNGO, ngoRemoveNeedValidator, removeNeed); // NGO can remove from its list of needs

module.exports = { NGOItemNeedsRouter };
