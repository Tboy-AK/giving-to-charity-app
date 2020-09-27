const { Router } = require('express');
const cookieParser = require('cookie-parser');
const authExpAccess = require('../middleware/auth-exp-access-middleware');
const authRefresh = require('../middleware/auth-refresh-middleware');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const { refreshAccess } = require('../controllers/session-controller')(errResponse, AuthModel);

const RefreshAccessRouter = Router();

RefreshAccessRouter.post('/auth/session', authExpAccess, cookieParser(), authRefresh, refreshAccess);

module.exports = { RefreshAccessRouter };
