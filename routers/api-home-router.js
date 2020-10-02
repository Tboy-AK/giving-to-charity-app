const { Router } = require('express');
const authAdmin = require('../middleware/auth-admin-middleware');
const { apiNavs } = require('../controllers/api-home-controller')();

const ApiHomeRouter = Router();

ApiHomeRouter.get('/', authAdmin, apiNavs);

module.exports = { ApiHomeRouter };
