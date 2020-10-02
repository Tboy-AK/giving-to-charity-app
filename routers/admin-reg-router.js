const { Router } = require('express');
const authAdmin = require('../middleware/auth-admin-middleware');
const adminRegValidator = require('../middleware/request-validators/admin-reg-validator');
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const { createAdmin } = require('../controllers/admin-reg-controller')(errResponse, AuthModel, AdminModel);

const AdminRegRouter = Router();

AdminRegRouter.post('/admin', authAdmin, adminRegValidator, createAdmin);

module.exports = { AdminRegRouter };
