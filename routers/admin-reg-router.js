const express = require('express');
// const authAdmin = require('../middleware/auth-admin');
const adminRegValidator = require('../middleware/request-validators/admin-reg-validator');
const errResponse = require('../utils/error-response-handler');

const AuthsModel = "require('../models/mongodb/auths-model')";
const AdminsModel = "require('../models/mongodb/admins-model')";
const { createAdmin } = require('../controllers/admin-reg-controller')(errResponse, AuthsModel, AdminsModel);

const AdminRegRouter = express.Router();

AdminRegRouter.post('/admin', adminRegValidator, createAdmin);

module.exports = { AdminRegRouter };
