const express = require('express');
const { createEngine } = require('express-react-views');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/winston-logger');
require('dotenv').config();

// Require routers
const { ApiHomeRouter } = require('./routers/api-home-router');
const { AdminRegRouter } = require('./routers/admin-reg-router');

const { urlencoded, json } = express;

const server = express();

server.set('views', `${__dirname}/views`);
server.set('view engine', 'jsx');
server.engine('jsx', createEngine());

server.use([urlencoded({ extended: false }), json()]);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
server.use(morgan('combined', { stream: accessLogStream }));

const version = process.env.VERSION || 'v1.0.0';
server.use(`/api/${version}`, [
  ApiHomeRouter,
  AdminRegRouter,
]);

const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

module.exports = server.listen(port, () => {
  logger.info(`Listening on ${hostname}:${port}`);
});
