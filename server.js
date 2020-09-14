const express = require('express');
const { createEngine } = require('express-react-views');
const logger = require('./utils/winston-logger');
require('dotenv').config();

// Require routers
const { ApiHomeRouter } = require('./routers/api-home-router');

const { urlencoded, json } = express;

const server = express();

server.set('views', `${__dirname}/views`);
server.set('view engine', 'jsx');
server.engine('jsx', createEngine());

server.use([urlencoded({ extended: false }), json()]);

const version = process.env.VERSION || 'v1.0.0';
server.use(`/api/${version}`, [
  ApiHomeRouter,
]);

const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

module.exports = server.listen(port, () => {
  logger.info(`Listening on ${hostname}:${port}`);
});
