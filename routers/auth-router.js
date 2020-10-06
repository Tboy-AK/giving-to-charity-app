const { Router } = require('express');
const cookieParser = require('cookie-parser');
const authUser = require('../middleware/auth-user-middleware');
const authValidator = require('../middleware/request-validators/auth-validator');
const authSignoutValidator = require('../middleware/request-validators/auth-signout-validator');
const authActivateValidator = require('../middleware/request-validators/auth-activate-validator');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const {
  activateUser, userSignin, refreshAccess, userSignout,
} = require('../controllers/auth-controller')(
  errResponse, AuthModel, { AdminModel, NGOModel },
);

// Middlewares to refresh user access
const authExpAccess = require('../middleware/auth-exp-access-middleware');
const authRefresh = require('../middleware/auth-refresh-middleware');

// Middlewares to activate user access
const authActivateAccess = require('../middleware/auth-activate-middleware');

// Routers
const AuthRouter = Router();

// Sign in user
AuthRouter
  .route('/auth/access')
  .post(authValidator, userSignin)
  .delete(authUser, authSignoutValidator, userSignout);

// Refresh user access
AuthRouter
  .route('/auth/refresh')
  .post(authExpAccess, cookieParser(), authRefresh, refreshAccess);

// Activate user
AuthRouter
  .route('/auth/activate/:authActivateToken')
  .patch(authActivateAccess, authActivateValidator, activateUser);

module.exports = { AuthRouter };
