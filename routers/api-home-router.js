const express = require('express');
const { apiNavs } = require('../controllers/api-home-controller')();

const ApiHomeRouter = express.Router();

ApiHomeRouter.get('/', apiNavs);

module.exports = { ApiHomeRouter };
